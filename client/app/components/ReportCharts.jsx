"use client";
import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  RadialLinearScale, PointElement, LineElement, Tooltip, Legend, Filler
);

/* ── Emotion Timeline Bar Chart ── */
export function EmotionTimelineChart({ emotions, isDark }) {
  const emotionColorMap = {
    neutral: { bg: "rgba(148,163,184,0.7)", border: "#94a3b8" },
    angry:   { bg: "rgba(239,68,68,0.7)",   border: "#ef4444" },
    happy:   { bg: "rgba(34,197,94,0.7)",    border: "#22c55e" },
    sad:     { bg: "rgba(59,130,246,0.7)",   border: "#3b82f6" },
    fear:    { bg: "rgba(168,85,247,0.7)",   border: "#a855f7" },
    disgust: { bg: "rgba(107,114,128,0.7)",  border: "#6b7280" },
    surprise:{ bg: "rgba(107,114,128,0.7)",  border: "#6b7280" },
  };

  const labels = emotions.map((e, i) => {
    const start = e.start_time ?? i * 4;
    return `${start.toFixed(0)}s`;
  });

  // Map each emotion to a numeric value for bar height, color per bar
  const emotionNames = [...new Set(emotions.map(e => (e.emotion || e).toLowerCase()))];
  const bgColors = emotions.map(e => {
    const em = (e.emotion || e).toLowerCase();
    return emotionColorMap[em]?.bg || emotionColorMap.neutral.bg;
  });
  const borderColors = emotions.map(e => {
    const em = (e.emotion || e).toLowerCase();
    return emotionColorMap[em]?.border || emotionColorMap.neutral.border;
  });

  // Calculate percentage for each emotion
  const totalCount = emotions.length;
  const emotionCounts = {};
  emotions.forEach(e => {
    const em = (e.emotion || e).toLowerCase();
    emotionCounts[em] = (emotionCounts[em] || 0) + 1;
  });

  const data = {
    labels,
    datasets: [{
      label: "Emotion Intensity",
      data: emotions.map(() => 1),
      backgroundColor: bgColors,
      borderColor: borderColors,
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const i = items[0].dataIndex;
            const e = emotions[i];
            const start = e.start_time ?? i * 4;
            const end = e.end_time ?? start + 4;
            return `${start.toFixed(0)}s – ${end.toFixed(0)}s`;
          },
          label: (item) => {
            const e = emotions[item.dataIndex];
            return (e.emotion || e).charAt(0).toUpperCase() + (e.emotion || e).slice(1);
          },
        },
      },
    },
    scales: {
      y: { display: false },
      x: {
        ticks: { color: isDark ? "#94a3b8" : "#64748b", font: { size: 10 }, maxRotation: 0 },
        grid: { display: false },
      },
    },
  };

  // Build a legend with percentages
  const legendItems = emotionNames.map(em => ({
    name: em.charAt(0).toUpperCase() + em.slice(1),
    color: emotionColorMap[em]?.border || "#94a3b8",
    percentage: totalCount > 0 ? ((emotionCounts[em] || 0) / totalCount * 100).toFixed(1) : "0.0",
  }));

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {legendItems.map(item => (
          <span key={item.name} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name} <span className="text-slate-400 dark:text-slate-500">({item.percentage}%)</span>
          </span>
        ))}
      </div>
      <div className="h-32">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

/* ── POS Distribution Doughnut ── */
export function POSChart({ posDetails, isDark }) {
  const posColors = ["#FF6A3D", "#FF9F43", "#FF3D71", "#6366f1", "#22c55e", "#3b82f6", "#a855f7", "#f59e0b"];
  const labels = Object.keys(posDetails).map(k => k.charAt(0).toUpperCase() + k.slice(1));
  const values = Object.values(posDetails);

  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: posColors.slice(0, labels.length).map(c => c + "cc"),
      borderColor: posColors.slice(0, labels.length),
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "55%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: isDark ? "#cbd5e1" : "#475569",
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-56">
      <Doughnut data={data} options={options} />
    </div>
  );
}

/* ── Linguistic Confidence Radar ── */
export function ConfidenceRadar({ analysis, isDark }) {
  const vocab = analysis.vocabulary;
  const fillers = analysis.filler_words;
  const hedge = analysis.hedge_words;
  const power = analysis.power_words;
  const sentence = analysis.sentence_structure;

  const labels = ["Lexical Diversity", "Low Fillers", "Low Hedges", "Power Words", "Sentence Variety"];
  const values = [
    Math.min((vocab?.lexical_diversity ?? 0) * 200, 100),
    Math.max(100 - (fillers?.percentage ?? 0) * 10, 0),
    Math.max(100 - (hedge?.percentage ?? 0) * 10, 0),
    Math.min((power?.percentage ?? 0) * 20, 100),
    Math.min(((sentence?.sentence_length_stats?.std ?? sentence?.sentence_length_stats?.avg ?? 10) / 20) * 100, 100),
  ];

  const data = {
    labels,
    datasets: [{
      label: "Your Speech",
      data: values,
      backgroundColor: "rgba(255, 106, 61, 0.15)",
      borderColor: "#FF6A3D",
      borderWidth: 2,
      pointBackgroundColor: "#FF6A3D",
      pointBorderColor: "#fff",
      pointBorderWidth: 1,
      pointRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: isDark ? "rgba(148,163,184,0.15)" : "rgba(148,163,184,0.3)" },
        angleLines: { color: isDark ? "rgba(148,163,184,0.15)" : "rgba(148,163,184,0.3)" },
        pointLabels: {
          color: isDark ? "#cbd5e1" : "#475569",
          font: { size: 11, weight: "500" },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const descriptions = {
              "Lexical Diversity": "Measures how varied and rich your word choices are",
              "Low Fillers": "Tracks minimal use of filler words like um, uh, like",
              "Low Hedges": "Reflects confident language without hedging phrases",
              "Power Words": "Usage of impactful and persuasive vocabulary",
              "Sentence Variety": "Diversity in sentence length and structure",
            };
            const label = items[0]?.label || "";
            return label;
          },
          afterTitle: (items) => {
            const descriptions = {
              "Lexical Diversity": "Measures how varied and rich your word choices are",
              "Low Fillers": "Tracks minimal use of filler words like um, uh, like",
              "Low Hedges": "Reflects confident language without hedging phrases",
              "Power Words": "Usage of impactful and persuasive vocabulary",
              "Sentence Variety": "Diversity in sentence length and structure",
            };
            const label = items[0]?.label || "";
            return descriptions[label] || "";
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Radar data={data} options={options} />
    </div>
  );
}

/* ── Animated Counter ── */
export function AnimatedCounter({ value, suffix = "", duration = 1200, className = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const target = typeof value === "number" ? value : parseFloat(value) || 0;
    const startTime = performance.now();
    let id;
    const animate = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Number.isInteger(target) ? Math.round(eased * target) : parseFloat((eased * target).toFixed(1)));
      if (p < 1) id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [started, value, duration]);

  return <span ref={ref} className={className}>{display}{suffix}</span>;
}
