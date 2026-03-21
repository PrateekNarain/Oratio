"use client";
import { useEffect, useRef, useState } from "react";

const Timer = ({ isRecording, isPaused, reset }) => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    let interval = null;

    if (isRecording && !isPaused) {
      // Start or continue the timer when recording and not paused
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (isPaused || !isRecording) {
      // Clear the interval when paused or recording is stopped
      clearInterval(interval);
    }

    // Reset the timer if 'reset' prop is true
    if (reset) {
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isRecording, isPaused, reset]); // Trigger re-render when isRecording, isPaused, or reset changes

  // Function to format time in mm:ss format
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-5xl font-mono font-bold tracking-wider text-white/90 tabular-nums">
        {formatTime(seconds)}
      </div>
      {isRecording && !isPaused && (
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
      )}
    </div>
  );
};

export default Timer;
