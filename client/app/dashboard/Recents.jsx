"use client";
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import '../components/bg.css';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '../context/DashboardDataContext';
import { useTheme } from '../context/ThemeContext';
import { MdOutlineRecordVoiceOver } from 'react-icons/md';

/* ── Animated block tower ── */
function BlockTower({ value, color, label }) {
  const blocks = 5;
  const filled = Math.round((value / 100) * blocks);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <div className="flex flex-col-reverse gap-[2px]">
        {Array.from({ length: blocks }).map((_, i) => {
          const active = visible && i < filled;
          return (
            <div
              key={i}
              className="rounded-[3px] transition-all"
              style={{
                width: 28,
                height: 6,
                backgroundColor: active ? color : undefined,
                opacity: active ? (0.5 + 0.5 * ((i + 1) / blocks)) : 1,
                boxShadow: active ? `0 0 6px ${color}40` : 'none',
                transitionDuration: `${300 + i * 100}ms`,
                transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
              }}
              {...(!active ? { className: 'rounded-[3px] transition-all bg-slate-200 dark:bg-slate-700/50', style: { width: 28, height: 6, transitionDuration: `${300 + i * 100}ms` } } : {})}
            />
          );
        })}
      </div>
      <span className="text-[11px] font-bold" style={{ color }}>{value}</span>
      <p className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}

const RecentSessions = () => {
  const router = useRouter();
  const { reports } = useDashboardData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reportsPerPage = 5;

  // Latest first
  const currentReports = [...reports].reverse().slice(0, reportsPerPage);

  const handleRowClick = (report) => {
    router.push(`/report?id=${report._id}`);
  };

  const colors = {
    voice: "#FF3D71",
    faces: "#FF6A3D",
    vocab: "#FF9F43"
  };

  return (
    <div className='flex flex-col w-full'>
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-[#FF6A3D] to-[#FF3D71] rounded-full" />
          Recent Sessions
        </h3>
        <Link href="/allreports" className="text-sm font-medium text-[#FF6A3D] hover:text-[#FF3D71] hover:underline transition-colors">
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {currentReports.map((report, i) => {
          const avg = Math.round(((report.scores?.voice || 0) + (report.scores?.expressions || 0) + (report.scores?.vocabulary || 0)) / 3);
          return (
            <div
              key={report._id}
              onClick={() => handleRowClick(report)}
              className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 opacity-0 animate-[fadeSlideUp_0.4s_ease-out_forwards]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Left: info + overall badge */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: `linear-gradient(135deg, ${colors.voice}, ${colors.vocab})` }}
                  >
                    {avg}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-white truncate group-hover:text-[#FF6A3D] transition-colors">
                      {report.title || 'Untitled Session'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {report.date || 'Recently Recorded'} • {report.context || 'General'}
                    </p>
                  </div>
                </div>

                {/* Right: block towers */}
                <div className="flex items-end gap-12">
                  <BlockTower value={report.scores?.voice || 0} color={colors.voice} label="Voice" />
                  <BlockTower value={report.scores?.expressions || 0} color={colors.faces} label="Faces" />
                  <BlockTower value={report.scores?.vocabulary || 0} color={colors.vocab} label="Vocab" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {currentReports.length === 0 && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-10 text-center">
          <span className="text-4xl mb-3 block"><MdOutlineRecordVoiceOver size={32} /></span>
          <p className="text-slate-500 dark:text-slate-400 mb-4">No sessions recorded yet.</p>
          <Link href="/session">
            <button className="px-5 py-2.5 bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              Start Your First Session
            </button>
          </Link>
        </div>
      )}

      {/* Keyframe for stagger animation */}
      <style jsx>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RecentSessions;
