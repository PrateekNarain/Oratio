"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const savedState = localStorage.getItem("sidebarOpen");
        if (savedState !== null) {
            setIsSidebarOpen(savedState === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        localStorage.setItem("sidebarOpen", newState);
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <main
                className={`flex-1 transition-all duration-300 ease-in-out p-6 pt-24 ${isSidebarOpen ? "ml-72" : "ml-20"}`}
            >
                {children}
            </main>
        </div>
    );
}
