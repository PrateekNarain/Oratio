"""
Lazy Model Manager — loads ML models purely on-demand.

Priority order:
  1. Active user requests (models loaded only when /upload is called)
  2. Website features (auth, dashboard, chat respond instantly — no ML needed)
  3. Background pre-warming (deferred until first upload completes)

No models are loaded at startup. The server starts instantly and serves all
non-ML endpoints (auth, reports, chat, health) without any delay.
"""

import threading
import logging

logger = logging.getLogger(__name__)


class ModelManager:
    """Thread-safe on-demand model loader. Models are loaded only when a user
    request actually needs them, keeping startup instant."""

    def __init__(self):
        self._whisper_processor = None
        self._whisper_model = None
        self._whisper_device = None
        self._emotion_recognizer = None
        self._spacy_nlp = None

        self._whisper_lock = threading.Lock()
        self._ser_lock = threading.Lock()
        self._spacy_lock = threading.Lock()

        self._whisper_ready = threading.Event()
        self._ser_ready = threading.Event()
        self._spacy_ready = threading.Event()

        # Track whether background pre-warm has been triggered
        self._prewarm_started = False
        self._prewarm_lock = threading.Lock()

    # ------------------------------------------------------------------ #
    #  Public read-only access (blocks only if model isn't loaded yet)    #
    # ------------------------------------------------------------------ #

    def get_whisper(self):
        """Returns (processor, model, device) tuple. Loads on first call."""
        if not self._whisper_ready.is_set():
            self._init_whisper()
        return self._whisper_processor, self._whisper_model, self._whisper_device

    def get_emotion_recognizer(self):
        """Returns SER model. Loads on first call."""
        if not self._ser_ready.is_set():
            self._init_ser()
        return self._emotion_recognizer

    def get_spacy_nlp(self):
        """Returns spaCy NLP pipeline. Loads on first call."""
        if not self._spacy_ready.is_set():
            self._init_spacy()
        return self._spacy_nlp

    # readiness checks (non-blocking)
    def is_whisper_ready(self):
        return self._whisper_ready.is_set()

    def is_ser_ready(self):
        return self._ser_ready.is_set()

    def is_spacy_ready(self):
        return self._spacy_ready.is_set()

    # ------------------------------------------------------------------ #
    #  Init helpers (thread-safe, idempotent)                             #
    # ------------------------------------------------------------------ #

    def _init_whisper(self):
        with self._whisper_lock:
            if self._whisper_ready.is_set():
                return
            logger.info("Loading Whisper transcription model (on-demand) …")
            import torch
            from transformers import WhisperProcessor, WhisperForConditionalGeneration

            model_name = "openai/whisper-medium"
            self._whisper_processor = WhisperProcessor.from_pretrained(model_name)
            self._whisper_model = WhisperForConditionalGeneration.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            )
            self._whisper_device = "cuda:0" if torch.cuda.is_available() else "cpu"
            self._whisper_model.to(self._whisper_device)
            self._whisper_ready.set()
            logger.info("Whisper model ready on %s", self._whisper_device)

    def _init_ser(self):
        with self._ser_lock:
            if self._ser_ready.is_set():
                return
            logger.info("Loading SpeechBrain SER model (on-demand) …")
            from speechbrain.inference.interfaces import foreign_class
            from speechbrain.utils.fetching import fetch, LocalStrategy

            source = "speechbrain/emotion-recognition-wav2vec2-IEMOCAP"
            savedir = "tmp_emotion_model"
            for f in ["hyperparams.yaml", "custom_interface.py",
                       "wav2vec2.ckpt", "model.ckpt", "label_encoder.txt"]:
                fetch(f, source=source, savedir=savedir,
                      local_strategy=LocalStrategy.COPY)

            self._emotion_recognizer = foreign_class(
                source=savedir,
                hparams_file="hyperparams.yaml",
                pymodule_file="custom_interface.py",
                classname="CustomEncoderWav2vec2Classifier",
                savedir=savedir,
            )
            self._ser_ready.set()
            logger.info("SpeechBrain SER model ready.")

    def _init_spacy(self):
        with self._spacy_lock:
            if self._spacy_ready.is_set():
                return
            logger.info("Loading spaCy model (on-demand) …")
            import spacy
            try:
                self._spacy_nlp = spacy.load("en_core_web_sm")
            except OSError:
                import subprocess, sys
                subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"],
                               check=True)
                self._spacy_nlp = spacy.load("en_core_web_sm")
            self._spacy_ready.set()
            logger.info("spaCy model ready.")

    # ------------------------------------------------------------------ #
    #  Background pre-warming (called AFTER first upload completes)       #
    # ------------------------------------------------------------------ #

    def prewarm_remaining(self):
        """After the first user upload finishes, pre-warm any models that
        weren't used yet so subsequent uploads are faster.  Called once."""
        with self._prewarm_lock:
            if self._prewarm_started:
                return
            self._prewarm_started = True

        def _warm():
            for name, loader in [
                ("spaCy", self._init_spacy),
                ("Whisper", self._init_whisper),
                ("SER", self._init_ser),
            ]:
                try:
                    loader()  # idempotent — skips if already loaded
                except Exception:
                    logger.exception("Pre-warm failed for %s", name)
            logger.info("All models pre-warmed for future requests.")

        thread = threading.Thread(target=_warm, name="model-prewarm", daemon=True)
        thread.start()

    # Keep for backward compat but make it a no-op at startup
    def start_background_loading(self):
        """No-op at startup. Models load on-demand when user uploads.
        Use prewarm_remaining() after first upload to warm the rest."""
        logger.info("ML models will load on-demand (no background pre-loading at startup).")


# Singleton
model_manager = ModelManager()
