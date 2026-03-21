"use client";
import React, { useEffect, useState, useRef } from 'react';
import { MdGraphicEq, MdEmojiEmotions, MdLibraryBooks, MdLeaderboard, MdBolt, MdBarChart, MdStar } from 'react-icons/md';
import { HiMicrophone } from 'react-icons/hi2';
import './bg.css';
import { useDashboardData } from '../context/DashboardDataContext';
import { useTheme } from '../context/ThemeContext';

/* ── Gradient activity ring ── */
// --- Infographic Style Circular Graph ---
// --- Infographic Pendulum Style Circular Graph ---
// --- Infographic Pendulum Style Circular Graph with Radial Gradient ---
function ActivityRing({ value, colorFrom, colorTo, label, icon, delay = 0, description }) {
    const [progress, setProgress] = useState(0);
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const size = 150;
    const stroke = 20;
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const gradId = `ring-grad-${label.replace(/\s/g, '')}`;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                setTimeout(() => {
                    setProgress(value);
                    const dur = 1200;
                    const start = performance.now();
                    const step = (now) => {
                        const p = Math.min((now - start) / dur, 1);
                        const eased = 1 - Math.pow(1 - p, 3);
                        setCount(Math.round(eased * value));
                        if (p < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }, delay);
                obs.disconnect();
            }
        }, { threshold: 0.2 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [value, delay]);

    const offset = circ - (circ * progress) / 100;
    const rating = value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : value >= 40 ? 'Average' : 'Needs Work';

    // Radial gradient for the arc: light to dark
    // SVG radialGradient is not supported for stroke, so we simulate with a conic gradient image as stroke, or fallback to a multi-stop linear gradient
    // We'll use a multi-stop linear gradient for best compatibility

    return (
        <div ref={ref} className="flex flex-col items-center gap-0 relative min-w-[210px]">
            {/* Shadow Layer */}
            <div className="absolute left-1/2 top-[60px] -translate-x-1/2 w-[120px] h-[120px] rounded-full bg-black/20 blur-2xl z-0" />
            {/* Main Circle */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <svg width={size} height={size} className="block">
                    <defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={colorFrom} />
                            <stop offset="40%" stopColor={colorFrom} />
                            <stop offset="70%" stopColor={colorTo} />
                            <stop offset="100%" stopColor="#181818" />
                        </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="stroke-[#23242a] dark:stroke-slate-700/60" />
                    {/* Progress Arc */}
                    <circle
                        cx={size/2}
                        cy={size/2}
                        r={r}
                        fill="none"
                        stroke={`url(#${gradId})`}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.22,1,0.36,1)' }}
                        filter="drop-shadow(0 4px 16px rgba(0,0,0,0.12))"
                    />
                </svg>
                {/* Center Content */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold" style={{ color: colorFrom }}>{count}<span className="text-base align-top font-bold opacity-80">%</span></span>
                    <span className="text-lg mt-1 font-bold" style={{ color: colorFrom }}>{icon}</span>
                </div>
            </div>
            {/* Pendulum Line and Circle (gradient, separated) */}
            <div className="flex flex-col items-center z-10">
                {/* Smaller gap between circle and pendulum */}
                <div style={{ height: 2 }} />
                {/* SVG for gradient line */}
                <svg width="8" height="36" style={{ display: 'block' }}>
                    <defs>
                        <linearGradient id={`pendulum-line-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#18181b" stopOpacity="1" />
                            <stop offset="100%" stopColor={colorTo} stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <rect x="2" y="0" width="4" height="36" rx="2" fill={`url(#pendulum-line-${gradId})`} />
                </svg>
                {/* Circle at the end of the pendulum */}
                <div style={{ width: 20, height: 20, background: colorTo, borderRadius: '50%', marginTop: 0, marginBottom: 8, boxShadow: `0 2px 12px ${colorTo}55` }} />
            </div>
            {/* Label & Description */}
            <div className="flex flex-col items-center mt-1 z-10">
                <span className="font-bold text-base tracking-wide" style={{ color: colorFrom }}>{label}</span>
                <span className="text-xs text-slate-300 mt-1 text-center" style={{ maxWidth: 140 }}>{description}</span>
                <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${colorFrom}15`, color: colorFrom }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorFrom }} />
                    {rating}
                </span>
            </div>
        </div>
    );
}

const PerformanceMetrics = () => {
    const { overallScores, reports } = useDashboardData();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [scores, setScores] = useState({ voice: 0, expressions: 0, vocabulary: 0 });

    useEffect(() => {
        if (!overallScores) return;
        if (overallScores.avg_voice === 0 && overallScores.avg_expressions === 0 && overallScores.avg_vocabulary === 0) return;
        setScores({
            voice: overallScores.avg_voice || 0,
            expressions: overallScores.avg_expressions || 0,
            vocabulary: overallScores.avg_vocabulary || 0,
        });
    }, [overallScores]);

    const overall = Math.round((scores.voice + scores.expressions + scores.vocabulary) / 3);
    const totalSessions = reports?.length || 0;

    const colors = {
        voice: "#FF3D71",
        expressions: "#FF6A3D",
        vocabulary: "#FF9F43",
    };


    return (
        <div className="w-full">
            {/* Top stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Overall Score", value: `${overall}%`, icon: <MdLeaderboard size={28} />, color: "from-[#FF6A3D] to-[#FF3D71]", highlight: true },
                    { label: "Total Sessions", value: totalSessions, icon: <MdGraphicEq size={28} />, color: "from-blue-500 to-cyan-400" },
                    { label: "Best Category", value: scores.voice >= scores.expressions && scores.voice >= scores.vocabulary ? "Voice" : scores.vocabulary >= scores.expressions ? "Vocabulary" : "Expressions", icon: <MdStar size={28} />, color: "from-amber-500 to-yellow-400" },
                    { label: "Latest Score", value: reports?.length > 0 ? `${Math.round(((reports[reports.length - 1]?.scores?.voice || 0) + (reports[reports.length - 1]?.scores?.expressions || 0) + (reports[reports.length - 1]?.scores?.vocabulary || 0)) / 3)}%` : "—", icon: <MdBolt size={28} />, color: "from-emerald-500 to-green-400" },
                ].map((stat, i) => (
                    <div
                        key={stat.label}
                        className={`relative overflow-hidden rounded-2xl p-4 ${stat.highlight ? 'bg-gradient-to-br ' + stat.color + ' text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                    >
                        {stat.highlight && <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />}
                        <div className="relative z-10">
                            <span className="text-xl">{stat.icon}</span>
                            <p className={`text-2xl font-black mt-1 ${stat.highlight ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                                {stat.value}
                            </p>
                            <p className={`text-xs mt-0.5 ${stat.highlight ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                {stat.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity rings */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-[#FF6A3D] to-[#FF3D71] rounded-full" />
                Average Performance
            </h3>
            <div className="flex flex-col md:flex-row gap-16 items-center justify-center">
                <ActivityRing
                    value={scores.voice}
                    colorFrom="#1ecfff"
                    colorTo="#3a8fff"
                    label="Voice"
                    icon={<HiMicrophone size={28} />}
                    delay={0}
                    description="Voice clarity and modulation score."
                />
                <ActivityRing
                    value={scores.expressions}
                    colorFrom="#ff3d71"
                    colorTo="#ff6a3d"
                    label="Expressions"
                    icon={<MdEmojiEmotions size={28} />}
                    delay={150}
                    description="Facial and emotional expression score."
                />
                <ActivityRing
                    value={scores.vocabulary}
                    colorFrom="#ff9f43"
                    colorTo="#ffc16a"
                    label="Vocabulary"
                    icon={<MdLibraryBooks size={28} />}
                    delay={300}
                    description="Vocabulary richness and usage score."
                />
            </div>
        </div>
    );
};

export default PerformanceMetrics;
