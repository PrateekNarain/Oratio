"use client";
import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Legend,
} from 'recharts';
import { useDashboardData } from '../context/DashboardDataContext';
import { useTheme } from '../context/ThemeContext';
import { MdBarChart } from 'react-icons/md';

const PerformanceChart = () => {
    const { reports } = useDashboardData();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [performanceData, setPerformanceData] = useState([]);

    useEffect(() => {
        if (reports && reports.length > 0) {
            const recentData = reports.slice(0, 10).reverse();
            const formattedData = recentData.map((report, index) => ({
                session: `S${index + 1}`,
                title: report.title || `Session ${index + 1}`,
                Voice: report.scores?.voice || 0,
                Expressions: report.scores?.expressions || 0,
                Vocabulary: report.scores?.vocabulary || 0,
            }));
            setPerformanceData(formattedData);
        } else {
            setPerformanceData([]);
        }
    }, [reports]);

    const colors = {
        voice: "#FF3D71",   // Accent pink
        faces: "#FF6A3D",   // Primary orange
        vocab: "#FF9F43"    // Secondary amber
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const title = payload[0].payload.title;
            // Only show each metric once
            const seen = new Set();
            const uniquePayload = payload.filter(entry => {
                if (seen.has(entry.name)) return false;
                seen.add(entry.name);
                return true;
            });
            return (
                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
                    <p className="font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</p>
                    {uniquePayload.map((entry, index) => (
                        <p key={index} className="text-sm font-medium">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-[#FF6A3D] to-[#FF9F43] rounded-full" />
                    Performance Trends
                </h3>
            </div>

            {performanceData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center min-h-[300px] text-center">
                    <div>
                        <span className="text-4xl mb-3 block"><MdBarChart size={32} /></span>
                        <p className="text-slate-400 dark:text-slate-500">Complete sessions to see your performance trends.</p>
                    </div>
                </div>
            ) : (
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                            <linearGradient id="voiceGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colors.voice} stopOpacity={0.15}/>
                                <stop offset="100%" stopColor={colors.voice} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="facesGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colors.faces} stopOpacity={0.15}/>
                                <stop offset="100%" stopColor={colors.faces} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="vocabGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colors.vocab} stopOpacity={0.15}/>
                                <stop offset="100%" stopColor={colors.vocab} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#F1F5F9'} vertical={false} />
                        <XAxis
                            dataKey="session"
                            stroke={isDark ? '#64748b' : '#94a3b8'}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke={isDark ? '#64748b' : '#94a3b8'}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            tickCount={6}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            content={() => {
                                const items = [
                                    { name: 'Voice', color: colors.voice },
                                    { name: 'Expressions', color: colors.faces },
                                    { name: 'Vocabulary', color: colors.vocab },
                                ];
                                return (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', paddingTop: '16px' }}>
                                        {items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
                                                <span style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }}
                        />
                        <Area type="monotone" dataKey="Voice" fill="url(#voiceGrad)" stroke="none" legendType="none" />
                        <Area type="monotone" dataKey="Expressions" fill="url(#facesGrad)" stroke="none" legendType="none" />
                        <Area type="monotone" dataKey="Vocabulary" fill="url(#vocabGrad)" stroke="none" legendType="none" />

                        <Line
                            type="monotone"
                            dataKey="Voice"
                            stroke={colors.voice}
                            strokeWidth={3}
                            dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 0, fill: colors.voice }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Expressions"
                            stroke={colors.faces}
                            strokeWidth={3}
                            dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 0, fill: colors.faces }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Vocabulary"
                            stroke={colors.vocab}
                            strokeWidth={3}
                            dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 0, fill: colors.vocab }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            )}
        </div>
    );
};

export default PerformanceChart;