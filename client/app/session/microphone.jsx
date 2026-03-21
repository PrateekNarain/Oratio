import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const BAR_COUNT = 48;

const MicrophonePulse = ({ isRecording, audioElement }) => {
  const [freqData, setFreqData] = useState(() => new Array(BAR_COUNT).fill(0));
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const connectedElementRef = useRef(null);

  useEffect(() => {
    let stream;

    // Mode 1: Visualize a playing <audio> element
    if (audioElement) {
      // Only set up the Web Audio graph once per audio element
      if (connectedElementRef.current !== audioElement) {
        // Clean up previous context if switching elements
        if (audioCtxRef.current) {
          audioCtxRef.current.close().catch(() => {});
        }
        sourceRef.current = null;

        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;

        const src = ctx.createMediaElementSource(audioElement);
        src.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = src;
        connectedElementRef.current = audioElement;
      }

      // Resume context if suspended (browser autoplay policy)
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const analyser = analyserRef.current;
      const dataArr = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArr);
        const step = Math.floor(dataArr.length / BAR_COUNT);
        const bars = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          bars.push(dataArr[i * step] / 255);
        }
        setFreqData(bars);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();

      return () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        // Don't close ctx or disconnect — keep the audio graph alive for replays
      };
    }

    // Mode 2: Live mic recording visualizer
    if (isRecording) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        stream = s;
        const src = ctx.createMediaStreamSource(s);
        src.connect(analyser);

        const dataArr = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(dataArr);
          // Sample BAR_COUNT evenly‑spaced bins
          const step = Math.floor(dataArr.length / BAR_COUNT);
          const bars = [];
          for (let i = 0; i < BAR_COUNT; i++) {
            bars.push(dataArr[i * step] / 255); // normalize 0‑1
          }
          setFreqData(bars);
          animRef.current = requestAnimationFrame(tick);
        };
        tick();
      });
    } else {
      // Gentle idle animation — keep the wave alive but subtle
      let t = 0;
      const idle = () => {
        t += 0.04;
        const bars = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          bars.push(0.08 + 0.06 * Math.sin(t + i * 0.3));
        }
        setFreqData(bars);
        animRef.current = requestAnimationFrame(idle);
      };
      idle();
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isRecording, audioElement]);

  return (
    <div className="flex flex-col items-center justify-center w-full select-none" style={{ minHeight: '38vh' }}>

      {/* ── Oratio Logo with glow ── */}
      <div className="relative mb-8">
        {/* Glow rings */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-700"
          style={{
            boxShadow: isRecording
              ? '0 0 60px 20px rgba(245,158,11,0.25), 0 0 120px 40px rgba(251,146,60,0.12)'
              : '0 0 30px 10px rgba(245,158,11,0.10)',
            transform: `scale(${isRecording ? 1.15 : 1})`,
          }}
        />
        <div
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-500 ${isRecording ? 'scale-110' : 'scale-100'}`}
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
          }}
        >
          <Image src="/logo1.png" alt="Oratio" width={72} height={72} className="drop-shadow-lg" />
        </div>
      </div>

      {/* ── Sound‑wave bars ── */}
      <div className="flex items-center justify-center gap-[2px] w-full max-w-lg h-28 px-4">
        {freqData.map((v, i) => {
          // Mirror effect: left side mirrors right
          const mid = BAR_COUNT / 2;
          const dist = Math.abs(i - mid) / mid; // 0 at center, 1 at edge
          const height = Math.max(4, v * 100 * (1 - dist * 0.3));

          return (
            <div
              key={i}
              className="rounded-full transition-[height] duration-75"
              style={{
                width: '3px',
                height: `${height}px`,
                background: `linear-gradient(180deg, #f59e0b ${Math.round(v * 100)}%, #ea580c)`,
                opacity: 0.5 + v * 0.5,
              }}
            />
          );
        })}
      </div>

      {/* ── Status label ── */}
      <p
        className={`mt-6 text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${
          isRecording ? 'text-amber-400 animate-pulse' : 'text-white/40'
        }`}
      >
        {isRecording ? 'Listening...' : 'Ready to record'}
      </p>
    </div>
  );
};

export default MicrophonePulse;
