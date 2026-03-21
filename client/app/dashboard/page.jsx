"use client";
import dynamic from 'next/dynamic';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardDataProvider } from '../context/DashboardDataContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import '../components/bg.css';
import ScrollReveal from '../components/ScrollReveal';

const PerformanceChart = dynamic(() => import('../components/PerformanceChart'), { ssr: false });
const PerformanceMetrics = dynamic(() => import('../components/OverallScore'), { ssr: false });
const RecentSessions = dynamic(() => import('./Recents'), { ssr: false });

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
    }, [router]);

    return (
        <DashboardDataProvider>
            <DashboardLayout>
                {/* Performance Overview - hero stats */}
                <ScrollReveal>
                    <div className="w-full mt-4">
                        <PerformanceMetrics />
                    </div>
                </ScrollReveal>

                {/* Chart full width */}
                <ScrollReveal delay={150}>
                    <div className="w-full mt-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                        <PerformanceChart />
                    </div>
                </ScrollReveal>

                {/* Recent Sessions */}
                <ScrollReveal delay={250}>
                    <div className="w-full mt-6">
                        <RecentSessions />
                    </div>
                </ScrollReveal>
            </DashboardLayout>
        </DashboardDataProvider>
    );
}