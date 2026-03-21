"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../components/bg.css';

export default function SignUp() {
    const [credentials, setCredentials] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (credentials.password !== credentials.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: credentials.name,
                    email: credentials.email,
                    password: credentials.password,
                }),
            });

            const json = await response.json();

            if (response.ok) {
                if (json.token) {
                    console.log("SignUp Success");
                    // Clear any stale data from previous user
                    localStorage.clear();
                    localStorage.setItem('token', json.token);
                    if (json.username) localStorage.setItem('username', json.username);
                    if (json.userId) {
                        localStorage.setItem('userId', json.userId);
                        // also store email for profile display
                        localStorage.setItem('email', json.userId);
                    } else {
                        // fallback: persist the email the user entered
                        localStorage.setItem('email', credentials.email);
                    }
                    router.push(`/dashboard`);
                }
            } else {
                setError(json.error || "Failed to sign up");
            }
        } catch (error) {
            setError("An error occurred while signing up. Please try again.");
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <section className="flex items-center justify-center min-h-screen px-4 static-bg relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 dark:opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 dark:opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10 fade-in">
                <div className="glass-bg rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-600 hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold gradient-text mb-2">
                                Create Account
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 text-sm">Join Oratio and improve your speaking skills</p>
                        </div>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="group">
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    autoComplete="name"
                                    className="w-full px-4 py-3 text-sm glass-bg border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                                    placeholder="John Doe"
                                    required
                                    onChange={onChange}
                                    value={credentials.name}
                                />
                            </div>
                            <div className="group">
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    autoComplete="email"
                                    className="w-full px-4 py-3 text-sm glass-bg border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                                    placeholder="your@email.com"
                                    required
                                    onChange={onChange}
                                    value={credentials.email}
                                />
                            </div>
                            <div className="group">
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 text-sm glass-bg border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                                    placeholder="••••••••"
                                    required
                                    onChange={onChange}
                                    value={credentials.password}
                                />
                            </div>
                            <div className="group">
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 text-sm glass-bg border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                                    placeholder="••••••••"
                                    required
                                    onChange={onChange}
                                    value={credentials.confirmPassword}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-8 py-3.5 mt-6 text-white text-sm font-semibold btn-gradient rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-amber-500/50"
                            >
                                Create Account
                            </button>
                        </form>

                        {error && <p className="text-red-400 text-sm mt-4 p-3 glass border border-red-500/30 rounded-xl">{error}</p>}

                        <div className="mt-6 flex items-center gap-2 text-center text-gray-500 dark:text-slate-400">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent"></div>
                            <span className="text-xs px-2">Already have an account?</span>
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 dark:via-slate-600 to-transparent"></div>
                        </div>

                        <p className="text-center text-gray-600 dark:text-slate-400 text-sm mt-6">
                            <Link href="/login" className="font-semibold gradient-text hover:opacity-80 transition-opacity">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
