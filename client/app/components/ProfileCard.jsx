"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '../context/DashboardDataContext';

export default function ProfileCard() {
  const router = useRouter();
  const { reports } = useDashboardData();
  const [user, setUser] = useState({ name: 'Guest', email: '' });

  useEffect(() => {
    const rawUsername = localStorage.getItem('username');
    const username = rawUsername && rawUsername !== 'undefined' && rawUsername !== 'null' ? rawUsername : 'Guest';
    const rawEmail = localStorage.getItem('email');
    const email = rawEmail && rawEmail !== 'undefined' && rawEmail !== 'null' ? rawEmail : '';
    setUser({ name: username, email });
  }, []);

  return (
    <div className="pro-card p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-rose-100 dark:from-amber-500/20 dark:to-rose-500/20 flex items-center justify-center text-2xl font-semibold text-rose-600 dark:text-orange-400 shadow-sm border border-rose-100 dark:border-rose-500/20">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col">
          <div className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{user.name}</div>
          <div className="text-sm muted-text mt-1">Recorded Sessions: <span className="text-slate-700 dark:text-slate-300 font-medium">{reports.length}</span></div>
        </div>
      </div>


    </div>
  );
}
