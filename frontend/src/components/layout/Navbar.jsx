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
              className="w-9 h-9 rounded-md bg-[#0B315B] hover:bg-blue-900 text-white font-semibold text-xs flex items-center justify-center transition-colors focus:ring-2 focus:ring-[#0B315B]/30"
              title="User Account Menu"
            >
              <span>{user ? getInitials(user.name) : 'VM'}</span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-md shadow-lg p-4 z-50 space-y-3 animate-in fade-in duration-100 text-left">
                <div className="pb-3 border-b border-slate-200 space-y-0.5">
                  <p className="font-semibold text-slate-800 text-sm">{user ? user.name : 'Vikramaditya Mehta'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium uppercase tracking-wide">
                    {user ? user.roleTitle : 'Business Owner'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {user?.role === 'lmd' ? (
                    <Link
                      to="/lmd"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#102A43] hover:bg-[#FDF3EC] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#B85D19]" />
                      <span>LMD Admin Control</span>
                    </Link>
                  ) : user?.role === 'officer' ? (
                    <Link
                      to="/officer"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#102A43] hover:bg-[#FDF3EC] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#B85D19]" />
                      <span>LMO / GATC Inspection Queue</span>
                    </Link>
                  ) : (
                    <Link
                      to="/business"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#102A43] hover:bg-[#FDF3EC] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#B85D19]" />
                      <span>Business Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#102A43] hover:bg-[#FDF3EC] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#B85D19]" />
                    <span>Return to Homepage</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Return to Homepage Button */}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#102A43] hover:bg-[#0A1C2E] text-white border border-[#B85D19]/40 font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 group"
          >
            <ArrowLeft className="w-4 h-4 text-[#C2672B] group-hover:-translate-x-1 transition-transform" />
            <span>Return to MaapSetu Homepage</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
