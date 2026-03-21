"use client";
import React, { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

export default function AnimatedCircularBar({
  targetValue,
  pathColor,
  textColor,
  trailColor,
  textSize = "20px",
  maxValue = 100,
  suffix = "",
  duration = 1200,
  className,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Single rAF-based animation instead of setInterval
  useEffect(() => {
    if (!hasAnimated) return;

    const target = Math.round(targetValue);
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    let animationId;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(eased * target);
      setDisplayValue(Math.min(val, target));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [hasAnimated, targetValue, duration]);

  return (
    <div ref={ref} className={className}>
      <CircularProgressbar
        value={displayValue}
        maxValue={maxValue}
        text={`${displayValue}${suffix}`}
        styles={buildStyles({
          pathColor,
          textColor,
          trailColor,
          textSize,
          pathTransitionDuration: 0.8,
        })}
      />
    </div>
  );
}
