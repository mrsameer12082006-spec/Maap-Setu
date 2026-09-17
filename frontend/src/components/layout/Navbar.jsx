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
    <header className="bg-[#FDF9F6] text-[#003943] relative z-40 border-b border-[#003943]/10 shadow-sm">
      {/* Main Bar */}
      <div className="w-full px-4 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3.5 group shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-[#003943] text-[#02B7BF] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Scale className="w-6 h-6 text-[#02B7BF]" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#003943] font-serif">Maap</span>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#00959C] font-serif italic">Setu</span>
          </div>
        </Link>

        {/* Right Side Action Area */}
        <div className="flex items-center gap-3">
          {/* User Profile Avatar Pill / Circle Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-11 h-11 rounded-full bg-[#003943] hover:bg-[#002B33] text-white font-extrabold text-sm flex items-center justify-center shadow-md border-2 border-[#00959C]/40 transition-transform active:scale-95"
              title="User Account Menu"
            >
              <span>{user ? getInitials(user.name) : 'VM'}</span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-[#003943]/20 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-[#003943]/10 space-y-0.5">
                  <p className="font-serif font-bold text-[#003943] text-sm">{user ? user.name : 'Vikramaditya Mehta'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#E0F5F6] text-[#003943] text-[10px] font-bold uppercase">
                    {user ? user.roleTitle : 'Business Owner'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {user?.role === 'lmd' ? (
                    <Link
                      to="/lmd"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#003943] hover:bg-[#E0F5F6] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#00959C]" />
                      <span>LMD Admin Control</span>
                    </Link>
                  ) : user?.role === 'officer' ? (
                    <Link
                      to="/officer"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#003943] hover:bg-[#E0F5F6] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#00959C]" />
                      <span>LMO / GATC Inspection Queue</span>
                    </Link>
                  ) : (
                    <Link
                      to="/business"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#003943] hover:bg-[#E0F5F6] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#00959C]" />
                      <span>Business Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#003943] hover:bg-[#E0F5F6] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#00959C]" />
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
            className="hidden sm:inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#003943] hover:bg-[#002B33] text-white border border-[#00959C]/40 font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 group"
          >
            <ArrowLeft className="w-4 h-4 text-[#02B7BF] group-hover:-translate-x-1 transition-transform" />
            <span>Return to MaapSetu Homepage</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
