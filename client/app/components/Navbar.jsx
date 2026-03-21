"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, ChevronRight, Settings } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import styles from "./ThemeSwitch.module.css";

// Reusable NavLink component
const NavLink = ({ children, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200 group"
    >
        <span className="flex-shrink-0 p-1.5 rounded-lg bg-slate-100 group-hover:bg-orange-100 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
        </span>
        <span className="font-medium">{children}</span>
    </button>
);

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [profilePhoto, setProfilePhoto] = useState(null);
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const profileFetchedRef = React.useRef(false);

    const fetchProfilePhoto = async (force = false) => {
        // Skip if already fetched (unless forced)
        if (profileFetchedRef.current && !force) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${API}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.profilePhoto) setProfilePhoto(data.profilePhoto);
            if (data.fullName) {
                setUsername(data.fullName);
                localStorage.setItem('username', data.fullName);
            }
            profileFetchedRef.current = true;
        } catch { /* silent */ }
    };

    useEffect(() => {
        // Check if user is logged in
        if (pathname === '/') {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('email');
            setIsLoggedIn(false);
            setProfilePhoto(null);
            profileFetchedRef.current = false;
            return;
        }
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            setIsLoggedIn(true);
            setUsername(localStorage.getItem("username") || "User");
            setEmail(localStorage.getItem("email") || localStorage.getItem("userId") || "");
            fetchProfilePhoto();
        } else {
            setIsLoggedIn(false);
        }
    }, [pathname]);

    // Listen for profile updates from the Edit Profile page
    useEffect(() => {
        const handleProfileUpdate = () => {
            setUsername(localStorage.getItem('username') || 'User');
            fetchProfilePhoto(true); // force refresh on explicit update
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('email');
        }
        setProfilePhoto(null);
        profileFetchedRef.current = false;
        setIsLoggedIn(false);
        router.push('/login');
    };

    const handleLogoClick = () => {
        if (isLoggedIn) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('email');
            setProfilePhoto(null);
            profileFetchedRef.current = false;
            setIsLoggedIn(false);
        }
        router.push('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    const scrollToSection = (id) => {
        if (pathname === '/') {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                setMenuOpen(false);
            }
        } else {
            router.push(`/#${id}`);
            setMenuOpen(false);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileOpen && !event.target.closest('.profile-dropdown')) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileOpen]);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled || pathname !== '/' ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-slate-200/80 dark:border-slate-700' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <button onClick={handleLogoClick} className="flex items-center space-x-2 group">
                            <div className="relative">
                                <Image
                                    src="/logo1.png"
                                    alt="Oratio Logo"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] rounded-full opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">
                                Oratio
                            </span>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    {pathname === '/' && !isLoggedIn && (
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-8">
                                <button
                                    onClick={() => scrollToSection("features")}
                                    className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    Features
                                </button>
                                <button
                                    onClick={() => scrollToSection("how-it-works")}
                                    className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    How It Works
                                </button>
                                <button
                                    onClick={() => scrollToSection("testimonials")}
                                    className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    Testimonials
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoggedIn && (
                        <div className="hidden md:flex items-center space-x-8 ml-10">
                            <Link href="/dashboard" className={`text-sm font-medium transition-colors duration-200 ${pathname === '/dashboard' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
                                Dashboard
                            </Link>
                            <Link href="/allreports" className={`text-sm font-medium transition-colors duration-200 ${pathname === '/allreports' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
                                Reports
                            </Link>
                        </div>
                    )}

                    <div className="hidden md:flex items-center space-x-4">
                        {/* Theme Toggle */}
                                                {/* Uiverse.io Theme Switcher */}
                                                <label className={styles.themeSwitch}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.themeSwitch__checkbox}
                                                        checked={theme === 'dark'}
                                                        onChange={toggleTheme}
                                                        aria-label="Toggle theme"
                                                    />
                                                    <div className={styles.themeSwitch__container}>
                                                        <div className={styles.themeSwitch__clouds}></div>
                                                        <div className={styles.themeSwitch__starsContainer}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9313 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor"></path>
                                                            </svg>
                                                        </div>
                                                        <div className={styles.themeSwitch__circleContainer}>
                                                            <div className={styles.themeSwitch__sunMoonContainer}>
                                                                <div className={styles.themeSwitch__moon}>
                                                                    <div className={styles.themeSwitch__spot}></div>
                                                                    <div className={styles.themeSwitch__spot}></div>
                                                                    <div className={styles.themeSwitch__spot}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>

                        {isLoggedIn ? (
                            <div className="relative profile-dropdown">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF6A3D] to-[#FF3D71] flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden">
                                        {profilePhoto ? (
                                            <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            username ? username.charAt(0).toUpperCase() : 'U'
                                        )}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 max-w-[100px] truncate">{username}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-90' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                                        <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{username}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link href="/profile" className="flex items-center px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg group transition-colors">
                                                <Settings className="w-4 h-4 mr-3 text-slate-400 group-hover:text-[#FF6A3D]" />
                                                Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg group transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-300" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <button className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/20">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/signup">
                                    <button className="bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/20">
                                        Get Started Free
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!menuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`md:hidden fixed inset-0 z-50 ${menuOpen ? 'block' : 'hidden'}`}>
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMenuOpen(false)}
                ></div>

                {/* Sidebar */}
                <div
                    className={`fixed right-0 top-0 h-full w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-700 shadow-2xl transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center space-x-2">
                                <Image
                                    src="/logo1.png"
                                    alt="Oratio Logo"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8"
                                />
                                <span className="text-xl font-bold bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] bg-clip-text text-transparent">
                                    Oratio
                                </span>
                            </div>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Mobile Login/Logout Buttons */}
                        {isLoggedIn ? (
                            <div className="w-full px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center space-x-3 mb-4 px-2">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6A3D] to-[#FF3D71] flex items-center justify-center text-white font-semibold">
                                        {username ? username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{username}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-400 truncate max-w-[150px]">{email}</p>
                                    </div>
                                </div>
                                <Link href="/dashboard" className="block text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                                <Link href="/allreports" className="block text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2" onClick={() => setMenuOpen(false)}>Reports</Link>
                                <button
                                    onClick={handleLogout}
                                    className="mt-3 w-full text-center text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200 border border-red-500/30 rounded-lg py-2"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="w-full px-4 py-3">
                                <Link href="/login" className="block w-full text-center bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/20 mb-3">
                                    Sign In
                                </Link>
                                <Link href="/signup" className="block w-full text-center border border-orange-500/50 text-orange-600 dark:text-orange-400 px-6 py-2.5 rounded-lg font-medium hover:bg-orange-500/10 transition-all duration-300">
                                    Get Started Free
                                </Link>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            {pathname === '/' && !isLoggedIn && (
                                <>
                                    <NavLink onClick={() => scrollToSection("features")} icon="M13 10V3L4 14h7v7l9-11h-7z">
                                        Features
                                    </NavLink>
                                    <NavLink onClick={() => scrollToSection("how-it-works")} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                                        How It Works
                                    </NavLink>
                                    <NavLink onClick={() => scrollToSection("testimonials")} icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                                        Testimonials
                                    </NavLink>
                                </>
                            )}
                        </nav>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-400 dark:text-slate-400">
                            <p>© {new Date().getFullYear()} Oratio. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
