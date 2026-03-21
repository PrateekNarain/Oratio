"use client";
import { useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import AnimatedCircularBar from "../components/AnimatedCircularBar";
import { useRouter } from "next/navigation";
import "../components/bg.css";
import DashboardLayout from "../components/DashboardLayout";
import { useTheme } from "../context/ThemeContext";

const UserReportsList = () => {
  const [reports, setReports] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#0f172a';
  const trailColor = isDark ? '#334155' : '#F1F5F9';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchReports = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API}/user-reports-list?userId=${encodeURIComponent(userId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();
        // Sort reports by most recent (createdAt or date)
        let sorted = data && data.length > 0 ? [...data] : [];
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA;
        });
        setReports(sorted);
      } catch (err) {
        console.error(err);
        // Fallback to empty array on error so we can show demo data if desired, 
        // or keep error state. For now, let's allow demo data to show on error/empty.
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-slate-600 dark:text-slate-400 animate-pulse">Loading reports...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-6 min-h-[80vh]">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71]">
              Your Reports
            </h1>

          </div>

          {reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">No reports yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">Start a new session to see your reports here.</p>
            </div>
          )}

          {reports.map((report) => (
            <div
              key={report._id}
              onClick={() => {
                router.push(`/report?id=${report._id}`);
              }}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-6 md:p-8"
            >
              {/* Hover Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-rose-50/50 dark:from-amber-500/5 dark:to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Title Section */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white group-hover:text-[#FF6A3D] transition-colors mb-2">
                    {report.title || 'Untitled Session'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {report.date || 'Recently Recorded'} • {report.context || 'General Context'}
                  </p>
                </div>

                {/* Metrics Section */}
                <div className="flex gap-4 md:gap-8 justify-center">
                  {/* Vocabulary */}
                  <div className="flex flex-col items-center gap-2">
                    <AnimatedCircularBar
                      className="w-16 h-16 md:w-20 md:h-20"
                      targetValue={report.scores?.vocabulary || 0}
                      pathColor="#FF9F43"
                      textColor={textColor}
                      trailColor={trailColor}
                      textSize="24px"
                      duration={800}
                    />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vocab</span>
                  </div>

                  {/* Voice */}
                  <div className="flex flex-col items-center gap-2">
                    <AnimatedCircularBar
                      className="w-16 h-16 md:w-20 md:h-20"
                      targetValue={report.scores?.voice || 0}
                      pathColor="#FF3D71"
                      textColor={textColor}
                      trailColor={trailColor}
                      textSize="24px"
                      duration={800}
                    />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Voice</span>
                  </div>

                  {/* Expressions */}
                  <div className="flex flex-col items-center gap-2">
                    <AnimatedCircularBar
                      className="w-16 h-16 md:w-20 md:h-20"
                      targetValue={report.scores?.expressions || 0}
                      pathColor="#FF6A3D"
                      textColor={textColor}
                      trailColor={trailColor}
                      textSize="24px"
                      duration={800}
                    />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Faces</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserReportsList;