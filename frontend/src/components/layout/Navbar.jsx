import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'VM';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-white text-slate-800 relative z-40 border-b border-slate-200">
      {/* Main Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center border border-slate-200 overflow-hidden p-1">
            <img src="/maapsetu_icon.png" alt="MaapSetu Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold tracking-tight text-[#0B315B]">Maap</span>
            <span className="text-xl font-bold tracking-tight text-[#C87541] italic">Setu</span>
          </div>
        </Link>

        {/* Right Side Action Area */}
        <div className="flex items-center gap-3">
          {/* User Profile Avatar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-sm bg-[#0B315B] hover:bg-[#082240] text-white font-mono font-bold text-xs flex items-center justify-center transition-colors border border-[#0B315B] focus:ring-2 focus:ring-[#0B315B]/30"
              title="User Account Menu"
            >
              <span>{user ? getInitials(user.name) : 'VM'}</span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-300 rounded-sm shadow-xl p-4 z-50 space-y-3 animate-in fade-in duration-100 text-left">
                <div className="h-1 bg-[#C87541] -mx-4 -mt-4 mb-3"></div>
                <div className="pb-3 border-b border-slate-200 space-y-0.5">
                  <p className="font-semibold text-slate-800 text-sm tracking-tight">{user ? user.name : 'Vikramaditya Mehta'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-xs bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold uppercase tracking-wider border border-slate-200">
                    {user ? user.roleTitle : 'Business Owner'}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  {user?.role === 'lmd' ? (
                    <Link
                      to="/lmd"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0B315B] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#C87541]" />
                      <span>LMD Admin Control</span>
                    </Link>
                  ) : user?.role === 'officer' ? (
                    <Link
                      to="/officer"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0B315B] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#C87541]" />
                      <span>LMO / GATC Inspection Queue</span>
                    </Link>
                  ) : (
                    <Link
                      to="/business"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0B315B] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#C87541]" />
                      <span>Business Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0B315B] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#C87541]" />
                    <span>Return to Homepage</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Return to Homepage Button */}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#0B315B] hover:bg-[#082240] text-white border border-[#0B315B] font-semibold text-xs transition-colors shrink-0 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C87541] group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
      <div className="vernier-ticks-sm w-full" />
    </header>
  );
};
