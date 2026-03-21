"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

import { MdWork, MdSchool, MdBarChart, MdRecordVoiceOver } from 'react-icons/md';

const useCases = [
  { icon: <MdWork size={28} />, title: "Job Interviews", desc: "Practice behavioral and technical interview answers with AI-scored feedback." },
  { icon: <MdSchool size={28} />, title: "Academic Presentations", desc: "Prepare for thesis defenses, viva voce, and classroom presentations." },
  { icon: <MdBarChart size={28} />, title: "Business Pitches", desc: "Refine your pitch delivery for investors, clients, and stakeholders." },
  { icon: <MdRecordVoiceOver size={28} />, title: "Public Speaking", desc: "Build confidence for conferences, keynotes, and team meetings." },
];

const testimonials = [
  { name: "Ishu", role: "Marketing Director", initial: "I", image: "/testimonials/ishu.jpg", text: "Oratio completely changed how I prepare for client presentations. The voice and expression feedback is spot-on." },
  { name: "Shivam", role: "Startup Founder", initial: "S", image: "/testimonials/shivam.jpg", text: "As a founder pitching to investors, Oratio's analytics helped me understand my speaking patterns and improve my delivery." },
  { name: "Eshan", role: "University Professor", initial: "E", image: "/testimonials/eshan.jpg", text: "I use Oratio to help students improve their presentation skills. The detailed feedback on pacing and vocabulary is invaluable." },
  { name: "Rina", role: "Corporate Trainer", initial: "R", image: "/testimonials/rina.jpg", text: "Oratio's real-time analysis has transformed my training workshops. The insights on tone and expression help me connect with every audience." },
];

function SliderDots({ count, active, onDot }) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDot(i)}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            i === active
              ? "w-8 bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71]"
              : "w-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

function InfiniteSlider({ items, renderItem, autoInterval = 3000, dotCount }) {
  const count = items.length;
  // Triple items: [copy][original][copy] — start in the middle
  const extended = useMemo(() => [...items, ...items, ...items], [items]);
  const startPos = count; // index into extended where original starts

  const [pos, _setPos] = useState(startPos);
  const posRef = useRef(startPos);
  const [smooth, setSmooth] = useState(true);
  const [paused, setPaused] = useState(false);
  const busyRef = useRef(false);
  const wheelAccum = useRef(0);
  const wheelTimer = useRef(null);
  const dragStart = useRef(null);

  const setPos = useCallback((v) => {
    const val = typeof v === "function" ? v(posRef.current) : v;
    posRef.current = val;
    _setPos(val);
  }, []);

  const slide = useCallback((dir) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setSmooth(true);
    setPos((p) => p + dir);
  }, [setPos]);

  // After smooth transition ends, check if teleport needed
  const onTransitionEnd = useCallback(() => {
    busyRef.current = false;
    const p = posRef.current;
    // If we've gone past the end of the middle copy, wrap to start of middle
    if (p >= startPos + count) {
      setSmooth(false);
      setPos(startPos + (p - startPos) % count);
    } else if (p < startPos) {
      setSmooth(false);
      setPos(startPos + count - ((startPos - p) % count || count));
    }
  }, [count, startPos, setPos]);

  // After a non-smooth teleport, re-enable smooth immediately
  useEffect(() => {
    if (!smooth) {
      // Use double-rAF to ensure DOM has painted the teleport before re-enabling transition
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setSmooth(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [smooth]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => slide(1), autoInterval);
    return () => clearInterval(id);
  }, [paused, autoInterval, slide]);

  // 2-finger trackpad / mouse wheel
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccum.current += delta;
    if (wheelTimer.current) clearTimeout(wheelTimer.current);
    wheelTimer.current = setTimeout(() => { wheelAccum.current = 0; }, 150);
    if (wheelAccum.current > 40) { slide(1); wheelAccum.current = 0; }
    else if (wheelAccum.current < -40) { slide(-1); wheelAccum.current = 0; }
  }, [slide]);

  // Attach wheel with { passive: false } so preventDefault works
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const handlers = {
    onTouchStart: (e) => { dragStart.current = e.touches[0].clientX; },
    onTouchEnd: (e) => {
      if (dragStart.current === null) return;
      const diff = dragStart.current - e.changedTouches[0].clientX;
      if (diff > 40) slide(1);
      else if (diff < -40) slide(-1);
      dragStart.current = null;
    },
    onMouseDown: (e) => { dragStart.current = e.clientX; },
    onMouseUp: (e) => {
      if (dragStart.current === null) return;
      const diff = dragStart.current - e.clientX;
      if (diff > 40) slide(1);
      else if (diff < -40) slide(-1);
      dragStart.current = null;
    },
  };

  const realIndex = ((posRef.current - startPos) % count + count) % count;

  const goTo = useCallback((i) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setSmooth(true);
    setPos(startPos + i);
  }, [startPos, setPos]);

  return (
    <div
      ref={containerRef}
      className="relative max-w-4xl mx-auto cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); dragStart.current = null; }}
      {...handlers}
    >
      <div className="overflow-hidden rounded-2xl">
        <div
          className={`flex ${smooth ? "transition-transform duration-[800ms] ease-in-out" : ""}`}
          style={{ transform: `translateX(-${pos * 50}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((item, i) => (
            <div key={i} className="w-1/2 flex-shrink-0 px-2">
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>
      <SliderDots count={dotCount || count} active={realIndex} onDot={goTo} />
    </div>
  );
}

function UseCasesSlider() {
  return (
    <section className="py-20 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Perfect For <span className="bg-gradient-to-r from-[#FF6A3D] to-[#FF9F43] bg-clip-text text-transparent">Every Scenario</span>
          </h2>
        </div>

        <InfiniteSlider
          items={useCases}
          autoInterval={3000}
          renderItem={(item) => (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 text-center h-full">
              <div className="text-5xl mb-5">{item.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">{item.desc}</p>
            </div>
          )}
        />
      </div>
    </section>
  );
}

function TestimonialsSlider() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [manual, setManual] = useState(false);
  const manualTimer = useRef(null);
  const dragStart = useRef(null);
  const wheelAccum = useRef(0);
  const wheelTimer = useRef(null);

  // When user interacts, pause marquee and allow manual scroll; resume after 2s idle
  const enterManual = useCallback(() => {
    setManual(true);
    if (manualTimer.current) clearTimeout(manualTimer.current);
    manualTimer.current = setTimeout(() => setManual(false), 2000);
  }, []);

  // Scroll the track by a pixel amount
  const scrollBy = useCallback((px) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollLeft += px;
  }, []);

  // On wheel (2-finger trackpad)
  const onWheel = useCallback((e) => {
    e.preventDefault();
    enterManual();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    scrollBy(delta);
  }, [enterManual, scrollBy]);

  // Attach wheel with passive:false
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Mouse drag
  const onMouseDown = (e) => { dragStart.current = { x: e.clientX, scrollLeft: containerRef.current?.scrollLeft || 0 }; enterManual(); };
  const onMouseMove = (e) => {
    if (!dragStart.current) return;
    const diff = dragStart.current.x - e.clientX;
    if (containerRef.current) containerRef.current.scrollLeft = dragStart.current.scrollLeft + diff;
  };
  const onMouseUp = () => { dragStart.current = null; };

  // Touch drag
  const onTouchStart = (e) => { dragStart.current = { x: e.touches[0].clientX, scrollLeft: containerRef.current?.scrollLeft || 0 }; enterManual(); };
  const onTouchMove = (e) => {
    if (!dragStart.current) return;
    const diff = dragStart.current.x - e.touches[0].clientX;
    if (containerRef.current) containerRef.current.scrollLeft = dragStart.current.scrollLeft + diff;
  };
  const onTouchEnd = () => { dragStart.current = null; };

  // Seamless loop: when scroll reaches end of first set, jump back to start
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const halfWidth = el.scrollWidth / 2;
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += halfWidth;
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // CSS animation speed: total width scrolls in ~30s for smooth slow movement
  const totalItems = testimonials.length;
  const animDuration = totalItems * 10; // 10s per card

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What Our <span className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">Users Say</span>
          </h2>
        </div>

        <div
          ref={containerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            ref={trackRef}
            className={`flex gap-4 w-max ${manual ? "" : "animate-marquee"}`}
            style={{ animationDuration: `${animDuration}s` }}
          >
            {/* Render items twice for seamless loop */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="w-[340px] md:w-[420px] flex-shrink-0">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 text-center h-full flex flex-col items-center justify-center">
                  <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover mx-auto mb-4 border-2 border-[#FF6A3D]" />
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg mb-4 max-w-sm mx-auto italic">&ldquo;{t.text}&rdquo;</p>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{t.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
                  <div className="flex justify-center mt-3 text-amber-400">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </section>
  );
}

export default function LandingPage() {
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Ace Every <span className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">Interview</span> With Confidence
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
            Practice interviews with AI-powered analysis of your voice, expressions, and vocabulary. Get real-time feedback to improve your delivery and land your dream role.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <button className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white px-8 py-4 rounded-xl font-medium text-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5">
                Start Practicing Free
              </button>
            </Link>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm"
            >
              See How It Works
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">3-in-1</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Voice, Face & Vocab Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">Real-time</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Instant AI Feedback</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">LLM</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Powered Coaching Reports</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to <span className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">Communicate better</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Our AI analyzes three key dimensions of your communication to give you a complete performance picture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Voice */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1">
              <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Voice & Tone Analysis</h3>
              <p className="text-slate-500 dark:text-slate-400">
                AI evaluates your vocal emotion, pace, and confidence level. Know if you sound nervous, monotone, or engaging before the real interview.
              </p>
            </div>

            {/* Feature 2 - Expressions */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1">
              <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Facial Expression Tracking</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Detects your facial expressions and body language cues throughout your response. Build the right impression with confident, approachable expressions.
              </p>
            </div>

            {/* Feature 3 - Vocabulary */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Vocabulary & Linguistics</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Evaluates word choice, filler words, sentence structure, and clarity. Get a professional vocabulary score and actionable tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How <span className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">Oratio</span> Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Three simple steps to transform your interview performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-[#FF6A3D] to-[#FF3D71] rounded-full flex items-center justify-center text-white font-bold text-lg z-10 shadow-lg">1</div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1" style={{backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-white dark:text-white">Record Your Practice</h3>
                  <p className="text-white dark:text-white">
                    Record yourself answering interview questions. Use your webcam and microphone — our AI processes video, audio, and speech simultaneously.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10 shadow-lg">2</div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1" style={{backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-500/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-white dark:text-white">Get AI Analysis</h3>
                  <p className="text-white dark:text-white">
                    Receive detailed scores on voice emotion, facial expressions, and vocabulary quality. Our AI generates personalized feedback reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10 shadow-lg">3</div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1" style={{backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-white dark:text-white">Improve & Track Progress</h3>
                  <p className="text-white dark:text-white">
                    Review reports, chat with AI about your performance, and track your improvement across sessions on your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/signup">
              <button className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white px-8 py-4 rounded-xl font-medium text-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5">
                Start Your First Practice
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases Section - Slider (lazy loaded) */}
      <Suspense fallback={<div className="py-20" />}>
        <UseCasesSlider />
      </Suspense>

      {/* Testimonials Section - Slider (lazy loaded) */}
      <Suspense fallback={<div className="py-20" />}>
        <TestimonialsSlider />
      </Suspense>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to level up your <span className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">speaking game?</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto">
            Practice with AI, get detailed feedback, and walk into your next interview with confidence.
          </p>
          <div className="flex justify-center">
            <Link href="/signup">
              <button className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white px-8 py-4 rounded-xl font-medium text-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative">
                  <Image
                    src="/logo1.png"
                    alt="Oratio Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">
                  Oratio
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                AI-powered interview coach that analyzes your voice, expressions, and vocabulary.
              </p>
            </div>

            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-sm">Features</a></li>
                <li><a href="#how-it-works" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-sm">How It Works</a></li>
                <li><a href="#testimonials" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-sm">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-sm">About Us</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-sm">Blog</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-sm">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 dark:text-slate-500 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Oratio. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-gray-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="text-gray-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
