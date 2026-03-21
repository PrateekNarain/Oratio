"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const DashboardDataContext = createContext(null);

// Cache data to avoid refetching on re-mounts (e.g. route changes)
const cache = { reports: null, overallScores: null, userId: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Call this from outside the provider to force next mount to re-fetch
export function invalidateDashboardCache() {
  cache.ts = 0;
  cache.reports = null;
  cache.overallScores = null;
}

export function DashboardDataProvider({ children }) {
  const [reports, setReports] = useState(cache.reports || []);
  const [overallScores, setOverallScores] = useState(cache.overallScores);
  const [loading, setLoading] = useState(!cache.reports);
  const [userId, setUserId] = useState(null);

  const fetchData = useCallback((uid) => {
    // Use cache if fresh
    if (cache.userId === uid && cache.reports && (Date.now() - cache.ts) < CACHE_TTL) {
      setReports(cache.reports);
      setOverallScores(cache.overallScores);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const headers = { 'Authorization': `Bearer ${token}` };

    setLoading(true);
    Promise.all([
      fetch(`${API}/user-reports-list?userId=${encodeURIComponent(uid)}`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/user-reports?userId=${encodeURIComponent(uid)}`, { headers }).then(r => r.ok ? r.json() : null),
    ])
      .then(([reportsList, overall]) => {
        const reps = Array.isArray(reportsList) ? reportsList : [];
        setReports(reps);
        setOverallScores(overall);
        // Update cache
        cache.reports = reps;
        cache.overallScores = overall;
        cache.userId = uid;
        cache.ts = Date.now();
      })
      .catch((err) => {
        console.error('DashboardDataContext fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const rawUserId = localStorage.getItem('userId');
    const uid = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' && rawUserId.trim() !== '' ? rawUserId : null;
    setUserId(uid);

    if (!uid) {
      setLoading(false);
      return;
    }

    fetchData(uid);
  }, [fetchData]);

  // Allow children to trigger a refresh (e.g. after new upload)
  const refresh = useCallback(() => {
    const uid = localStorage.getItem('userId');
    if (uid) {
      cache.ts = 0; // invalidate cache
      fetchData(uid);
    }
  }, [fetchData]);

  return (
    <DashboardDataContext.Provider value={{ reports, overallScores, loading, userId, refresh }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) return { reports: [], overallScores: null, loading: false, userId: null, refresh: () => { } };
  return ctx;
}
