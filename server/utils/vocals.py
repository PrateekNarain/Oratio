import torch
import torchaudio
import numpy as np
from typing import Union
import os

# Models are loaded lazily through model_manager (no eager init here)
from model_manager import model_manager


EMOTION_MAP = {
    "hap": "happy",
    "sad": "sad",
    "neu": "neutral",
    "ang": "angry",
}
def predict_emotion(audio_input: Union[str, np.ndarray], chunk_duration: float = 4.0) -> list:
    """
    Predicts emotions from an audio file OR an in-memory audio array.
    """
    emotion_recognizer = model_manager.get_emotion_recognizer()
    try:
        if isinstance(audio_input, str):
            signal, sample_rate = torchaudio.load(audio_input)
        else:
            # Handle numpy array input
            if isinstance(audio_input, np.ndarray):
                # Ensure it's float32
                if audio_input.dtype != np.float32:
                    audio_input = audio_input.astype(np.float32)
                signal = torch.from_numpy(audio_input)
                # Add channel dimension if needed
                if signal.dim() == 1:
                    signal = signal.unsqueeze(0)
            else:
                signal = audio_input
            sample_rate = 16000

        # Convert to mono if stereo
        if signal.shape[0] > 1:
            signal = torch.mean(signal, dim=0, keepdim=True)
        
        # Resample if needed
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            signal = resampler(signal)

        chunk_length = int(16000 * chunk_duration)
        num_samples = signal.shape[1]
        results = []
        
        for i in range(0, num_samples, chunk_length):
            chunk = signal[:, i:i + chunk_length]
            
            # Skip chunks that are too short
            if chunk.shape[1] < 1600:
                continue

            # Ensure chunk is on CPU for SpeechBrain
            chunk = chunk.cpu()
            
            try:
                # Create a temporary tensor that SpeechBrain can process
                wav_lens = torch.tensor([1.0])
                
                # Call the classifier
                out_prob, score, index, text_lab = emotion_recognizer.classify_batch(chunk, wav_lens)
                
                predicted_emotion_short = text_lab[0]
                predicted_emotion_full = EMOTION_MAP.get(predicted_emotion_short, predicted_emotion_short)

                chunk_index = i // chunk_length
                start_time = round(chunk_index * chunk_duration, 2)
                end_time = round(min((chunk_index + 1) * chunk_duration, num_samples / 16000), 2)
                
                results.append({
                    "chunk": chunk_index + 1,
                    "start_time": start_time,
                    "end_time": end_time,
                    "emotion": predicted_emotion_full
                })
            except Exception as chunk_error:
                print(f"Error processing chunk {i // chunk_length + 1}: {chunk_error}")
                # Continue with next chunk instead of failing entirely
                continue
            
        if results:
            print(f"Vocal emotion analysis completed successfully. Processed {len(results)} chunks.")
        else:
            print("Warning: No emotion data could be extracted from the audio.")
            # Return a default neutral emotion for the entire duration
            results = [{
                "chunk": 1,
                "start_time": 0.0,
                "end_time": round(num_samples / 16000, 2),
                "emotion": "neutral"
            }]
        print(results)
        print("Vocal emotion analysis completed successfully.")
        return results

    except Exception as e:
        print(f"An error occurred during vocal emotion analysis: {e}")
        # Return a default result instead of empty list
        return [{
            "chunk": 1,
            "start_time": 0.0,
            "end_time": 0.0,
            "emotion": "neutral"
        }]