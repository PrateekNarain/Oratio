"use client";
import { useState } from "react";
import Markdown from "markdown-to-jsx";

export default function CollapsibleCard({ title, icon, accentColor, children, defaultOpen = false, markdown = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      style={{ borderLeftWidth: "3px", borderLeftColor: accentColor }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold" style={{ color: accentColor }}>{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: open ? "2000px" : "0", opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-6 md:px-6">
          {markdown ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
              <Markdown>{typeof children === "string" ? children : "No feedback available."}</Markdown>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
