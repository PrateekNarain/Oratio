"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '../components/bg.css';
import DashboardLayout from '../components/DashboardLayout';
import { User, ChevronDown, ChevronUp } from 'lucide-react';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: User },
];

const inputClass = "w-full p-3 glass-bg border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 text-slate-900 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 text-sm";
const labelClass = "text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5";
const readOnlyClass = "w-full p-3 glass-bg border border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 dark:text-slate-500 cursor-not-allowed text-sm";

function SectionHeader({ id, icon: Icon, title, children, isCollapsed, onToggle, sectionRef }) {
  return (
    <div ref={sectionRef} className="pro-card overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF6A3D] to-[#FF3D71] flex items-center justify-center text-white">
            <Icon size={18} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
        {isCollapsed ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronUp size={20} className="text-slate-400" />}
      </button>
      {!isCollapsed && <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">{children}</div>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [collapsedSections, setCollapsedSections] = useState({});
  const sectionRefs = useRef({});

  // Personal Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);

  // Load profile data on mount
  useEffect(() => {
    const rawEmail = localStorage.getItem('userId');
    const emailVal = rawEmail && rawEmail !== 'undefined' && rawEmail !== 'null' ? rawEmail : '';
    setEmail(emailVal);

    const rawUsername = localStorage.getItem('username');
    setFullName(rawUsername && rawUsername !== 'undefined' ? rawUsername : '');

    async function loadProfile() {
      if (!emailVal) return;
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.fullName) setFullName(data.fullName);
        if (data.phone) setPhone(data.phone);
        if (data.location) setLocation(data.location);
        if (data.profilePhoto) setPhotoPreview(data.profilePhoto);
      } catch { /* silent */ }
    }
    loadProfile();
  }, []);

  // Scroll to section
  function scrollToSection(id) {
    setActiveSection(id);
    if (collapsedSections[id]) {
      setCollapsedSections(prev => ({ ...prev, [id]: false }));
    }
    setTimeout(() => {
      sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function toggleSection(id) {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // Photo handler
  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  // Save
  async function handleSave(e) {
    e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', message: 'Not logged in. Please log in again.' });
      return;
    }
    setSaving(true);
    setStatus(null);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('userId', email);
      formData.append('fullName', fullName);
      formData.append('phone', phone);
      formData.append('location', location);
      if (profilePhoto) formData.append('profilePhoto', profilePhoto);

      const res = await fetch(`${API}/auth/profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Update failed');
      localStorage.setItem('username', fullName || localStorage.getItem('username'));
      setStatus({ type: 'success', message: 'Profile saved successfully!' });
      window.dispatchEvent(new Event('profileUpdated'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus({ type: 'error', message: String(err.message || err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-rose-600">
            Edit Profile
          </h1>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.push('/dashboard')} className="px-5 py-2 glass-bg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:border-amber-500 dark:hover:border-amber-400 transition-all text-sm font-medium">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 btn-gradient text-white rounded-xl hover:shadow-amber-500/50 transition-all text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {status && (
          <div className={`text-sm p-3 rounded-xl mb-4 ${status.type === 'error' ? 'text-red-500 dark:text-red-400 glass-bg border border-red-500/30' : 'text-green-500 dark:text-green-400 glass-bg border border-green-500/30'}`}>
            {status.message}
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <nav className="hidden lg:flex flex-col gap-1 min-w-[200px] sticky top-24 self-start">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                    activeSection === s.id
                      ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* Form */}
          <form onSubmit={handleSave} className="flex-1 space-y-4">

            {/* 1. Personal Info */}
            <SectionHeader id="personal" icon={User} title="Personal Information" isCollapsed={collapsedSections['personal']} onToggle={toggleSection} sectionRef={el => (sectionRefs.current['personal'] = el)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-100 to-rose-100 dark:from-amber-500/20 dark:to-rose-500/20 flex items-center justify-center overflow-hidden border-2 border-amber-200 dark:border-amber-500/30 flex-shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-rose-600 dark:text-orange-400">{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div>
                    <button type="button" onClick={() => photoInputRef.current?.click()} className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">
                      Change Photo
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="John Doe" />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input value={email} readOnly className={readOnlyClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} className={inputClass} placeholder="City, Country" />
                </div>
              </div>
            </SectionHeader>

            {/* Bottom Save */}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => router.push('/dashboard')} className="px-6 py-2.5 glass-bg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:border-amber-500 dark:hover:border-amber-400 transition-all text-sm font-medium">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 btn-gradient text-white rounded-xl hover:shadow-amber-500/50 transition-all text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
