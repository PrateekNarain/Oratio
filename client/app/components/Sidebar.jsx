"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  History,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Trash2,
  X,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import "./bg.css";

// NavItem Component
const NavItem = ({ href, icon, label, collapsed, isActiveOverride, onDelete }) => {
  const pathname = usePathname();
  const isActive = isActiveOverride || pathname === href;

  return (
    <Link href={href} className="block mb-1 group/nav">
      <div className={`relative overflow-hidden rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-500/10 dark:to-rose-500/10 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>

        {/* Active Indicator (Left Strip) */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-gradient-to-b from-[#FF6A3D] to-[#FF3D71] rounded-r-full" />
        )}

        <div className={`relative flex items-center p-2.5 text-sm font-medium transition-all duration-200 ${collapsed ? "justify-center" : "space-x-3"}`}>
          <div className={`transition-all duration-200 ${isActive ? 'text-[#FF6A3D]' : 'text-slate-400 dark:text-slate-500 group-hover/nav:text-slate-700 dark:group-hover/nav:text-slate-300'}`}>
            {React.cloneElement(icon, {
              className: `w-5 h-5`,
              strokeWidth: isActive ? 2.5 : 1.5
            })}
          </div>

          {!collapsed && (
            <>
              <span className={`whitespace-nowrap truncate max-w-[140px] flex-1 transition-all duration-200 ${isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 group-hover/nav:text-slate-900 dark:group-hover/nav:text-white'}`}>
                {label}
              </span>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="opacity-0 group-hover/nav:opacity-100 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all duration-150 shrink-0"
                  title="Move to trash"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [sessions, setSessions] = useState([]);
  const [trashedSessions, setTrashedSessions] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const API = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`)
    : 'http://127.0.0.1:5000';

  const fetchSessions = async () => {
    const rawUserId = localStorage.getItem('userId');
    const userId = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' && rawUserId.trim() !== '' ? rawUserId : null;

    if (!userId) {
      setSessions([]);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API}/user-reports-list?userId=${encodeURIComponent(userId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      // Sort sessions by most recent (assuming 'date' or 'createdAt' property exists)
      let sorted = data && data.length > 0 ? [...data] : [];
      sorted.sort((a, b) => {
        // Prefer 'date', fallback to 'createdAt', fallback to 0
        const dateA = new Date(a.date || a.createdAt || 0);
        const dateB = new Date(b.date || b.createdAt || 0);
        return dateB - dateA;
      });
      setSessions(sorted.slice(0, 10));
    } catch (error) {
      console.error('Sidebar fetch error:', error);
      setSessions([]);
    }
  };

  const fetchTrash = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || userId === 'undefined' || userId === 'null') return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API}/trash?userId=${encodeURIComponent(userId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrashedSessions(data);
      }
    } catch (error) {
      console.error('Trash fetch error:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchTrash();
  }, [refreshKey]);

  // Listen for report rename events to refresh the sidebar immediately
  useEffect(() => {
    const handleReportRenamed = () => {
      fetchSessions();
    };
    window.addEventListener('reportRenamed', handleReportRenamed);
    return () => window.removeEventListener('reportRenamed', handleReportRenamed);
  }, []);

  const handleDelete = async (sessionId) => {
    const token = localStorage.getItem('token');
    try {
      // Optimistically move from sessions to trash immediately
      const deletedSession = sessions.find(s => s._id === sessionId);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      if (deletedSession) {
        setTrashedSessions(prev => [
          { ...deletedSession, deletedAt: new Date().toISOString() },
          ...prev
        ]);
      }

      // Always redirect to dashboard on delete
      router.push('/dashboard');

      const response = await fetch(`${API}/report/${sessionId}/trash`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        // Revert optimistic update on failure
        if (deletedSession) {
          setSessions(prev => [...prev, deletedSession].sort((a, b) =>
            new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
          ));
          setTrashedSessions(prev => prev.filter(s => s._id !== sessionId));
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      // Refresh from server on error
      setRefreshKey(k => k + 1);
    }
  };

  const handleRestore = async (sessionId) => {
    const token = localStorage.getItem('token');
    try {
      // Optimistically move from trash back to sessions
      const restoredSession = trashedSessions.find(s => s._id === sessionId);
      setTrashedSessions(prev => prev.filter(s => s._id !== sessionId));
      if (restoredSession) {
        const { deletedAt, ...cleanSession } = restoredSession;
        setSessions(prev => [cleanSession, ...prev].sort((a, b) =>
          new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
        ).slice(0, 10));
      }

      const response = await fetch(`${API}/report/${sessionId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        // Revert on failure
        if (restoredSession) {
          setTrashedSessions(prev => [restoredSession, ...prev]);
          setSessions(prev => prev.filter(s => s._id !== sessionId));
        }
      }
    } catch (error) {
      console.error('Restore error:', error);
      setRefreshKey(k => k + 1);
    }
  };

  const handlePermanentDelete = async (sessionId) => {
    const token = localStorage.getItem('token');
    try {
      // Optimistically remove from trash
      const removedSession = trashedSessions.find(s => s._id === sessionId);
      setTrashedSessions(prev => prev.filter(s => s._id !== sessionId));

      const response = await fetch(`${API}/report/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        // Revert on failure
        if (removedSession) {
          setTrashedSessions(prev => [...prev, removedSession]);
        }
      }
    } catch (error) {
      console.error('Permanent delete error:', error);
      setRefreshKey(k => k + 1);
    }
  };

  const openTrash = () => {
    fetchTrash();
    setShowTrash(true);
  };

  const daysUntilDeletion = (deletedAt) => {
    const deleted = new Date(deletedAt);
    const expiry = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    return Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="h-full pt-16 pointer-events-none">
      <aside
        className={`fixed left-0 h-[calc(100vh-80px)] pointer-events-auto transition-all duration-300 ease-out
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
          shadow-[1px_0_8px_-2px_rgba(0,0,0,0.06)] z-30 flex flex-col
          ${isOpen ? "w-72" : "w-20"}`}
        style={{ top: "80px" }}
      >
        {/* Toggle Button */}
        <div className="flex justify-end p-3 border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={toggleSidebar}
            className="group p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-4 px-3">

          {/* Header if Open */}
          {isOpen && (
            <div className="mb-3 px-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Your Reports
              </h3>
            </div>
          )}

          {/* List */}
          <div className="space-y-1">
            {sessions.length === 0 ? (
              isOpen && (
                <div className="px-2 py-6 text-center">
                  <MessageSquare size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">No sessions yet</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Start a new session below</p>
                </div>
              )
            ) : (
              sessions.map((session, idx) => (
                <NavItem
                  key={session._id}
                  href={`/report?id=${session._id}`}
                  icon={<MessageSquare size={18} />}
                  label={session.title || `Session ${idx + 1}`}
                  collapsed={!isOpen}
                  isActiveOverride={pathname.includes('report') && searchParams.get('id') === session._id}
                  onDelete={() => handleDelete(session._id)}
                />
              ))
            )}
          </div>

          {/* View All / History Link */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <NavItem
              href="/allreports"
              icon={<History size={20} />}
              label="View All History"
              collapsed={!isOpen}
            />
          </div>
        </div>

        {/* Bottom Section: Recycle Bin + New Session */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
          {/* Recycle Bin Button */}
          <button
            onClick={openTrash}
            className={`w-full flex items-center ${isOpen ? 'justify-start gap-2 px-4' : 'justify-center'} py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200`}
          >
            <Trash2 size={18} />
            {isOpen && <span>Recycle Bin</span>}
            {isOpen && trashedSessions.length > 0 && (
              <span className="ml-auto text-xs bg-red-100 dark:bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-semibold">{trashedSessions.length}</span>
            )}
          </button>

          {/* New Session */}
          <Link href="/session" className="block group">
            {isOpen ? (
              <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Plus size={18} strokeWidth={2.5} />
                New Session
              </button>
            ) : (
              <button className="w-full h-12 flex justify-center items-center rounded-xl bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200">
                <Plus size={22} strokeWidth={2.5} />
              </button>
            )}
          </Link>
        </div>

        {/* Trash Panel Overlay */}
        {showTrash && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTrash(false)} />

            {/* Panel */}
            <div className="relative ml-auto w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Trash2 size={20} className="text-slate-500" />
                  <h3 className="font-semibold text-slate-800 dark:text-white">Recycle Bin</h3>
                </div>
                <button onClick={() => setShowTrash(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <p className="px-4 pt-3 pb-1 text-xs text-slate-400 dark:text-slate-500">Items are permanently deleted after 30 days.</p>

              {/* Trash List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {trashedSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                    <Trash2 size={40} className="mb-3 opacity-30" />
                    <p className="text-sm">Recycle bin is empty</p>
                  </div>
                ) : (
                  trashedSessions.map((session) => (
                    <div key={session._id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 group/trash">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{session.title || 'Untitled Session'}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            {daysUntilDeletion(session.deletedAt)} days left
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleRestore(session._id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Restore"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(session._id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete permanently"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
