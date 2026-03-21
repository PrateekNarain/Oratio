"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Timer from "./timer";
import MicrophonePulse from "./microphone";
import { Video, Mic, Upload, Pause, Play, Check, ArrowLeft, Send } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import "../components/bg.css";
import ContextDialog from "./context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "../context/ThemeContext";
import { invalidateDashboardCache } from "../context/DashboardDataContext";

// ─── Phases ───
const PHASE_SELECT = "select";
const PHASE_RECORDING = "recording";
const PHASE_PREVIEW = "preview";

const WebRTCRecorder = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const previewAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);

  const [phase, setPhase] = useState(PHASE_SELECT);
  const [mode, setMode] = useState(null); // "video" | "audio"
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [stream, setStream] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const streamRef = useRef(null); // keep in sync with stream state

  // Context dialog
  const [showContextDialog, setShowContextDialog] = useState(false);
  const [context, setContext] = useState("");
  const [title, setTitle] = useState("");
  const [isContextSaved, setIsContextSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  // ─── Media helpers ───
  const stopAllTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  const startMedia = useCallback(async (videoMode) => {
    try {
      const constraints = videoMode
        ? { video: { aspectRatio: { ideal: 16 / 9 }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
        : { audio: true };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      return s;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast.error("Could not access your camera/microphone.");
      return null;
    }
  }, []);

  // ─── Enter recording screen (preview only, no recording yet) ───
  const enterRecordingScreen = async (selectedMode) => {
    setMode(selectedMode);
    setRecordedChunks([]);
    setUploadedFile(null);
    setPreviewUrl(null);
    setIsRecording(false);
    setIsPaused(false);
    const isVideo = selectedMode === "video";
    const s = await startMedia(isVideo);
    if (!s) return;
    streamRef.current = s;
    setPhase(PHASE_RECORDING);
  };

  // Attach stream to video element once phase is RECORDING and video mounts
  useEffect(() => {
    if (phase === PHASE_RECORDING && mode === "video" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [phase, mode]);

  // ─── Actually start recording ───
  const beginRecording = () => {
    const s = streamRef.current;
    if (!s) return;
    const isVideo = mode === "video";
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "";
    const options = mimeType ? { mimeType } : {};
    const mr = new MediaRecorder(s, options);
    mediaRecorderRef.current = mr;
    const chunks = [];
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mr.onstop = () => {
      setRecordedChunks(chunks);
      const blob = new Blob(chunks, { type: isVideo ? "video/webm" : "audio/webm" });
      setPreviewUrl(URL.createObjectURL(blob));
      setPhase(PHASE_PREVIEW);
    };
    mr.start();
    setIsRecording(true);
    setIsPaused(false);
  };

  // ─── Pause / Resume ───
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
    } else {
      mediaRecorderRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  // ─── Finish recording ───
  const finishRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    stopAllTracks();
    streamRef.current = null;
    setIsRecording(false);
    setIsPaused(false);
  };

  // ─── Handle file upload ───
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const validTypes = [
      "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
      "audio/wav", "audio/mpeg", "audio/webm", "audio/ogg", "audio/mp4", "audio/x-m4a",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid video or audio file.");
      return;
    }
    const isVideo = file.type.startsWith("video");
    setMode(isVideo ? "video" : "audio");
    setUploadedFile(file);
    setRecordedChunks([]);
    setPreviewUrl(URL.createObjectURL(file));
    setPhase(PHASE_PREVIEW);
  };

  // ─── Back to selection ───
  const backToSelect = () => {
    stopAllTracks();
    streamRef.current = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordedChunks([]);
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAudioReady(false);
    setPhase(PHASE_SELECT);
    setMode(null);
    setTitle("");
    setContext("");
    setIsContextSaved(false);
  };

  // ─── Re-record ───
  const reRecord = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAudioReady(false);
    setRecordedChunks([]);
    setUploadedFile(null);
    enterRecordingScreen(mode);
  };

  // ─── Send / Upload ───
  const handleSend = async () => {
    if (!title.trim()) {
      toast.error("Please enter a session name before sending.");
      return;
    }
    if (!uploadedFile && recordedChunks.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    if (uploadedFile) {
      formData.append("file", uploadedFile);
    } else {
      const isVideo = mode === "video";
      const ext = isVideo ? "mp4" : "wav";
      const blob = new Blob(recordedChunks, { type: isVideo ? "video/webm" : "audio/webm" });
      formData.append("file", blob, `recording.webm`);
    }

    formData.append("context", context);
    formData.append("title", title || "Untitled Session");
    formData.append("mode", mode || "video");

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Please log in again.");
      setLoading(false);
      return;
    }
    formData.append("userId", userId);

    try {
      const token = localStorage.getItem("token");
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }

      const data = await response.json();
      const reportId = data._id;

      toast.success("Report generated! Redirecting...", { autoClose: 2000 });

      // Invalidate dashboard cache so it re-fetches with the new report
      invalidateDashboardCache();

      // Navigate to report page with the actual report ID
      router.push(`/report?id=${reportId}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContextSave = ({ title: t, text }) => {
    setContext(text);
    setTitle(t);
    setIsContextSaved(true);
  };

  // ─── RENDER ───
  return (
    <DashboardLayout>
      <ToastContainer />
      <ContextDialog
        isOpen={showContextDialog}
        onClose={() => setShowContextDialog(false)}
        onSave={handleContextSave}
        initialContext={context}
      />

      {/* ═══════════════════════════════════════════════
          PHASE 1: MODE SELECTION
      ═══════════════════════════════════════════════ */}
      {phase === PHASE_SELECT && (
        <div className="flex min-h-[calc(100vh-6rem)] relative">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative z-10">
            {/* Logo */}
            <div className="mb-4">
              <Image src="/logo1.png" alt="Oratio" width={56} height={56} className="drop-shadow-lg" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent mb-2">New Session</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-12">Choose how you'd like to record</p>

            {/* 3 Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
              {/* Video */}
              <button
                onClick={() => enterRecordingScreen("video")}
                className="group relative flex flex-col items-center gap-5 p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm hover:border-[#FF6A3D]/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6A3D] to-[#FF9F43] flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 group-hover:scale-105 transition-all duration-300">
                  <Video size={28} className="text-white" />
                </div>
                <span className="text-slate-800 dark:text-white font-bold text-lg">Video</span>
                <span className="text-slate-400 dark:text-white/40 text-xs">Record with camera</span>
              </button>

              {/* Audio */}
              <button
                onClick={() => enterRecordingScreen("audio")}
                className="group relative flex flex-col items-center gap-5 p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm hover:border-[#FF3D71]/40 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF3D71] to-[#FF6A3D] flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:shadow-rose-500/40 group-hover:scale-105 transition-all duration-300">
                  <Mic size={28} className="text-white" />
                </div>
                <span className="text-slate-800 dark:text-white font-bold text-lg">Audio</span>
                <span className="text-slate-400 dark:text-white/40 text-xs">Record with microphone</span>
              </button>

              {/* Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center gap-5 p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm hover:border-[#FF9F43]/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9F43] to-[#FF6A3D] flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 group-hover:scale-105 transition-all duration-300">
                  <Upload size={28} className="text-white" />
                </div>
                <span className="text-slate-800 dark:text-white font-bold text-lg">Upload</span>
                <span className="text-slate-400 dark:text-white/40 text-xs">Video or audio file</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          PHASE 2: FULLSCREEN RECORDING
      ═══════════════════════════════════════════════ */}
      {phase === PHASE_RECORDING && (
        <div className="fixed inset-0 z-50 bg-[#0a0e1a] flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/40">
            <button onClick={backToSelect} className="text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <ArrowLeft size={18} /> Cancel
            </button>
            <div className="flex items-center gap-3">
              {isRecording && (
                <div className="flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">
                    {isPaused ? "Paused" : "Rec"}
                  </span>
                </div>
              )}
              {isRecording && <Timer isRecording={isRecording} isPaused={isPaused} reset={false} />}
            </div>
            <div className="w-20" />
          </div>

          {/* Main content area */}
          <div className="flex-1 flex items-center justify-center min-h-0 p-4">
            {mode === "video" ? (
              <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <MicrophonePulse isRecording={isRecording && !isPaused} />
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-center gap-6 px-6 py-6 bg-black/40">
            {!isRecording ? (
              <button
                onClick={beginRecording}
                className="flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-br from-[#FF6A3D] to-[#FF3D71] text-white font-semibold text-lg shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="w-4 h-4 rounded-full bg-white" />
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {isPaused ? <Play size={22} className="text-white ml-0.5" /> : <Pause size={22} className="text-white" />}
                </button>
                <button
                  onClick={finishRecording}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6A3D] to-[#FF3D71] flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Check size={28} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          PHASE 3: PREVIEW & SEND
      ═══════════════════════════════════════════════ */}
      {phase === PHASE_PREVIEW && (
        <div className="flex min-h-[calc(100vh-6rem)] relative">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
            {/* Back */}
            <div className="w-full max-w-3xl mb-6">
              <button onClick={backToSelect} className="text-slate-400 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-2 text-sm">
                <ArrowLeft size={18} /> Back
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Preview your {mode === "video" ? "video" : "audio"}</h2>

            {/* Session Name Input */}
            <div className="w-full max-w-3xl mb-6">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Session Name <span className="text-[#FF3D71]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quarterly Business Review"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/50 focus:border-[#FF6A3D] transition-all"
                maxLength={100}
              />
            </div>

            {/* Player */}
            <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 shadow-lg">
              {mode === "video" ? (
                <video ref={previewVideoRef} src={previewUrl} controls className="w-full max-h-[55vh] object-contain" />
              ) : (
                <div className="p-10 flex flex-col items-center gap-6 bg-slate-50 dark:bg-transparent">
                  <MicrophonePulse isRecording={false} audioElement={audioReady ? previewAudioRef.current : null} />
                  <audio
                    ref={(el) => {
                      previewAudioRef.current = el;
                      if (el && !audioReady) setAudioReady(true);
                    }}
                    src={previewUrl}
                    controls
                    className="w-full max-w-md"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 mt-8">
              {/* Re-record (only if it was a recording, not upload) */}
              {!uploadedFile && (
                <button
                  onClick={reRecord}
                  className="px-6 py-3 rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
                >
                  Re-record
                </button>
              )}

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={loading || !title.trim()}
                className={`px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-orange-500/25 ${!title.trim() ? 'grayscale' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send for Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WebRTCRecorder;