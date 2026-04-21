import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import {
  Key,
  Loader2,
  Palette,
  Check,
  Github,
  Twitter,
  Globe,
  Link2,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("streamdash-theme") || "dark",
  );
  const [passwords, setPasswords] = useState({
    oldpassword: "",
    newpassword: "",
    confpassword: "",
  });
  const [socials, setSocials] = useState({
    github: "",
    twitter: "",
    portfolio: "",
  });
  const [isTerminating, setIsTerminating] = useState(false);
  const themes = [
    { id: "dark", name: "Onyx Dark", bg: "bg-[#0a0a0a]", accent: "bg-red-600" },
    { id: "light", name: "High Contrast", bg: "bg-white", accent: "bg-black" },
    {
      id: "matrix",
      name: "Matrix Terminal",
      bg: "bg-[#000a00]",
      accent: "bg-[#00ff41]",
    },
    {
      id: "eva-01",
      name: "EVA-01 Unit",
      bg: "bg-[#1a0b2e]",
      accent: "bg-[#a7ff00]",
    },
    {
      id: "akira",
      name: "Neo Tokyo",
      bg: "bg-[#0f0f0f]",
      accent: "bg-[#ff0000]",
    },
    {
      id: "gameboy",
      name: "Pixel Pocket",
      bg: "bg-[#8bac0f]",
      accent: "bg-[#0f380f]",
    },
    {
      id: "cyber",
      name: "Neon Acid",
      bg: "bg-[#050505]",
      accent: "bg-[#ccff00]",
    },
    {
      id: "blood-moon",
      name: "Blood Moon",
      bg: "bg-[#0d0202]",
      accent: "bg-[#ff4d4d]",
    },
    {
      id: "bubblegum-punk",
      name: "Pink Glitch",
      bg: "bg-[#12000a]",
      accent: "bg-[#00f2ff]",
    },
    {
      id: "blueprint",
      name: "Draft Mode",
      bg: "bg-[#003366]",
      accent: "bg-white",
    },
    {
      id: "stardust",
      name: "Pixel Galaxy",
      bg: "bg-[#0b0e14]",
      accent: "bg-[#7b61ff]",
    },
  ];

  // Theme Switcher Logic
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("streamdash-theme", newTheme);
  };

  // Password Update Logic
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newpassword !== passwords.confpassword)
      return alert("Passwords don't match");

    setLoading(true);
    try {
      await api.patch("/users/change-password", passwords);
      alert("Password updated successfully!");
      setPasswords({ oldpassword: "", newpassword: "", confpassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Socials Update Logic
  const handleUpdateSocials = async () => {
    setSocialLoading(true);
    try {
      await api.patch("/users/update-account", socials);
      alert("Artifacts linked successfully!");
    } catch (err) {
      alert("Failed to update social links");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleLogout = async () => {
    // 1. UI Confirmation
    if (!window.confirm("Terminate session?")) return;

    try {
      // 2. Tell backend to clear cookies
      await api.post("/users/logout");
    } catch (err) {
      console.warn("Backend already cleared or unreachable");
    } finally {
      // 3. NUCLEAR EXIT: Clear state and force refresh
      logout();
      window.location.href = "/auth"; // This is faster/safer than navigate for logouts
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10 text-white pb-20 animate-in fade-in duration-500">
      <header>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
          Settings
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">
          // Configuration & Security
        </p>
      </header>

      {/* 1. INTERFACE VIBE */}
      <section className="glass border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 text-primary pb-4 border-b border-white/5">
          <Palette size={20} />
          <h2 className="text-lg font-black uppercase tracking-widest italic">
            Interface Vibe
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${t.bg} ${
                theme === t.id
                  ? "border-primary scale-[1.02] shadow-2xl"
                  : "border-white/5 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex flex-col items-start gap-4">
                <div className="flex gap-2">
                  <div className={`w-4 h-4 rounded-full ${t.accent}`} />
                  <div className="w-4 h-4 rounded-full bg-gray-700" />
                </div>
                <span
                  className={`text-[11px] font-black uppercase tracking-widest ${t.id === "light" ? "text-black" : "text-white"}`}
                >
                  {t.name}
                </span>
              </div>
              {theme === t.id && (
                <div className="absolute top-4 right-4 bg-primary rounded-full p-1 text-white">
                  <Check size={14} />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 2. SECURITY */}
      <section className="glass border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5 text-primary">
          <Key className="w-5 h-5" />
          <h3 className="text-xl font-black uppercase italic">
            Update Password
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Current Password"
              required
              className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-primary transition-all text-white"
              value={passwords.oldpassword}
              onChange={(e) =>
                setPasswords({ ...passwords, oldpassword: e.target.value })
              }
            />
            <div className="hidden md:block" />
            <input
              type="password"
              placeholder="New Password"
              required
              className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-primary transition-all text-white"
              value={passwords.newpassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newpassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-primary transition-all text-white"
              value={passwords.confpassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confpassword: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary px-10 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:grayscale"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </section>

      {/* 3. LINKED ARTIFACTS */}
      <section className="glass border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 text-primary pb-4 border-b border-white/5">
          <Link2 size={20} />
          <h2 className="text-lg font-black uppercase tracking-widest italic">
            Linked Artifacts
          </h2>
        </div>

        <div className="space-y-4">
          <SocialInput
            icon={Github}
            placeholder="github_username"
            value={socials.github}
            onChange={(val) => setSocials({ ...socials, github: val })}
            onSave={handleUpdateSocials}
            loading={socialLoading}
          />
          <SocialInput
            icon={Twitter}
            placeholder="@handle"
            value={socials.twitter}
            onChange={(val) => setSocials({ ...socials, twitter: val })}
            onSave={handleUpdateSocials}
            loading={socialLoading}
          />
          <SocialInput
            icon={Globe}
            placeholder="https://yourwork.com"
            value={socials.portfolio}
            onChange={(val) => setSocials({ ...socials, portfolio: val })}
            onSave={handleUpdateSocials}
            loading={socialLoading}
          />
        </div>
      </section>

      {/* 4. DANGER ZONE */}
      <section className="glass border border-red-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center bg-red-500/5 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-red-500/10 rounded-2xl text-red-500">
            <LogOut size={28} />
          </div>
          <div>
            <p className="font-black uppercase italic text-lg leading-none">
              Terminate Session
            </p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-2">
              Log out of your current account
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full md:w-auto px-10 py-4 border-2 border-red-500/30 text-red-500 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg"
        >
          Logout
        </button>
      </section>
    </div>
  );
}

function SocialInput({
  icon: Icon,
  placeholder,
  value,
  onChange,
  onSave,
  loading,
}) {
  return (
    <div className="group">
      <div className="flex items-center bg-black/40 border border-white/5 rounded-2xl overflow-hidden focus-within:border-primary/50 transition-all">
        <div className="p-4 bg-white/[0.02] border-r border-white/5 text-gray-500 group-focus-within:text-primary transition-colors">
          <Icon size={20} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent p-4 text-sm font-medium outline-none text-white placeholder:text-gray-700"
        />
        <button
          onClick={onSave}
          disabled={loading}
          className="px-6 py-2 m-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white rounded-xl transition-all border border-white/5 disabled:opacity-50"
        >
          {loading ? "..." : "Link"}
        </button>
      </div>
    </div>
  );
}
