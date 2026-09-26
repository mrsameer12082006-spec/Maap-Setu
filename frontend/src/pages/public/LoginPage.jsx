import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Building2, UserCheck, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth, USER_ROLES } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || USER_ROLES.BUSINESS;

  const { loginAsRole, registerUser, user, currentRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  // ── Redirect if already authenticated with explicit redirect param ─────────
  // Only fires on page mount / session restore — NOT after fresh login
  // (fresh login navigation is handled synchronously inside handleSubmit).
  useEffect(() => {
    const redirectPath = searchParams.get('redirect');
    if (redirectPath && user && currentRole) {
      const homes = { business: '/business', lmd: '/lmd', officer: '/officer' };
      const home = homes[currentRole] || '/';
      const dest = redirectPath.startsWith(`/${currentRole}`) ? redirectPath : home;
      navigate(dest, { replace: true });
    }
  }, [user, currentRole, searchParams, navigate]);

  // ── Helper: build a role-safe landing path ─────────────────────────────────
  const safeDest = (dbRole) => {
    const homes = { business: '/business', lmd: '/lmd', officer: '/officer' };
    const home = homes[dbRole] || '/';
    const redirectPath = searchParams.get('redirect');
    if (redirectPath && redirectPath.startsWith(`/${dbRole}`)) return redirectPath;
    return home;
  };
  const [username, setUsername] = useState(
    defaultRole === USER_ROLES.LMD_ADMIN
      ? 'lmd01@maapsetu.demo'
      : defaultRole === USER_ROLES.OFFICER
      ? 'lmo01@maapsetu.demo'
      : ''
  );
  const [password, setPassword] = useState(
    defaultRole === USER_ROLES.BUSINESS ? '' : 'MaapSetu@2026'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign Up Mode State (Available for Business Role)
  // NOTE: defaults are intentionally BLANK so new users provide their own details
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Success Feedback Banners
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginSuccess(false);
    setSignUpSuccess(false);
    setErrorMsg('');

    if (isSignUp) {
      // ── Client-side validation ──────────────────────────────────────────────
      if (!fullName.trim()) { setErrorMsg('Full name is required.'); setLoading(false); return; }
      if (!signUpEmail.trim()) { setErrorMsg('Email address is required.'); setLoading(false); return; }
      if (signUpPassword.length < 6) { setErrorMsg('Password must be at least 6 characters.'); setLoading(false); return; }
      if (signUpPassword !== confirmPassword) { setErrorMsg('Passwords do not match.'); setLoading(false); return; }

      try {
        const regRes = await registerUser(signUpEmail.trim(), signUpPassword, {
          name: fullName.trim(),
          phone: mobileNumber.trim() || null,
          role: USER_ROLES.BUSINESS,
          organization: null,
        });

        setSignUpSuccess(true);
        setUsername(signUpEmail.trim());
        setPassword(signUpPassword);

        // If session was established immediately, navigate to portal
        if (regRes?.session) {
          navigate(safeDest('business'), { replace: true });
        } else {
          // If email confirmation is required, show success and switch to login tab with credentials ready
          setIsSignUp(false);
        }
      } catch (error) {
        setErrorMsg(error.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }

    } else {
      try {
        const authRes = await loginAsRole(username, password);
        const effectiveRole = authRes?.profile?.role || currentRole || selectedRole;

        setLoginSuccess(true);
        navigate(safeDest(effectiveRole), { replace: true });
      } catch (error) {
        setErrorMsg('Invalid login credentials. ' + (error.message || ''));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setIsSignUp(false);
    setLoginSuccess(false);
    setSignUpSuccess(false);
    setErrorMsg('');
    if (roleKey === USER_ROLES.BUSINESS) {
      setUsername('');
      setPassword('');
    } else if (roleKey === USER_ROLES.LMD_ADMIN) {
      setUsername('lmd01@maapsetu.demo');
      setPassword('MaapSetu@2026');
    } else if (roleKey === USER_ROLES.OFFICER) {
      setUsername('lmo01@maapsetu.demo');
      setPassword('MaapSetu@2026');
    }
  };

  return (
    <div className="w-full min-h-[85vh] drafting-grid-bg bg-slate-50 text-slate-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-sm border border-slate-300 shadow-xl overflow-hidden relative">
        {/* Subtle top accent line in Warm Copper */}
        <div className="h-1 bg-[#C87541] w-full"></div>

        <div className="p-8 sm:p-10 space-y-6">
          {/* Brand & Technical Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-sm bg-white flex items-center justify-center border border-slate-300 p-1">
                  <img src="/maapsetu_icon.png" alt="MaapSetu Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold tracking-tight text-[#0B315B]">Maap</span>
                  <span className="text-xl font-bold tracking-tight text-[#C87541] italic">Setu</span>
                </div>
              </Link>
              
              <div className="border border-slate-300 bg-slate-50 px-2 py-0.5 rounded-xs">
                <span className="text-[9px] font-mono uppercase font-semibold text-slate-600 tracking-wider">
                  LM-ACT 2009
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                Authentication Terminal • Access Control
              </span>
              <h1 className="text-2xl font-bold text-[#0B315B] tracking-tight">
                {isSignUp ? 'Create Business Account' : 'Sign in to MaapSetu'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isSignUp
                  ? 'Register your enterprise to submit verification and calibration applications.'
                  : 'Enter authenticated credentials to access your metrology terminal.'}
              </p>
            </div>
            <div className="vernier-ticks-sm w-full -mb-2" />
          </div>

          {/* Role Selector Tabs (Visible during Sign In) */}
          {!isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                Authorized Portal Route
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-sm">
                <button
                  type="button"
                  onClick={() => handleRoleSelect(USER_ROLES.BUSINESS)}
                  className={`py-2 px-2 rounded-sm text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === USER_ROLES.BUSINESS
                      ? 'bg-white text-[#0B315B] shadow-xs border border-slate-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-[#C87541]" />
                  <span>Business</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect(USER_ROLES.LMD_ADMIN)}
                  className={`py-2 px-2 rounded-sm text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === USER_ROLES.LMD_ADMIN
                      ? 'bg-white text-[#0B315B] shadow-xs border border-slate-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#C87541]" />
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect(USER_ROLES.OFFICER)}
                  className={`py-2 px-2 rounded-sm text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === USER_ROLES.OFFICER
                      ? 'bg-white text-[#0B315B] shadow-xs border border-slate-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 shrink-0 text-[#C87541]" />
                  <span>Officer</span>
                </button>
              </div>
            </div>
          )}

        {/* Success / Error Alerts */}
        {signUpSuccess && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Business account created</p>
              <p className="text-emerald-700 mt-0.5">Please check your email to verify your address, then sign in.</p>
            </div>
          </div>
        )}

        {loginSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-sm text-emerald-900 text-xs font-mono font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>SESSION_AUTH: Access granted. Redirecting...</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-sm text-red-900 text-xs font-mono font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>AUTH_ERROR: {errorMsg}</span>
          </div>
        )}

        {/* Form */}
        {isSignUp ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Full Name / Authorized Person
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Vikramaditya Mehta"
                required
                className="w-full bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0B315B] focus:ring-1 focus:ring-[#0B315B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0B315B] focus:ring-1 focus:ring-[#0B315B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0B315B] focus:ring-1 focus:ring-[#0B315B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 pr-10 text-sm text-slate-800 focus:outline-none focus:border-[#0B315B] focus:ring-1 focus:ring-[#0B315B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 pr-10 text-sm text-slate-800 focus:outline-none focus:border-[#0B315B] focus:ring-1 focus:ring-[#0B315B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 min-h-[44px] rounded-sm bg-[#0B315B] hover:bg-[#082240] text-white font-semibold text-sm transition-colors border border-[#0B315B] flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            </button>

            <p className="text-center text-xs text-slate-500 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setLoginSuccess(false);
                  setSignUpSuccess(false);
                  setErrorMsg('');
                }}
                className="text-[#C87541] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700">
                  {selectedRole === USER_ROLES.BUSINESS
                    ? 'Business Email or Mobile'
                    : selectedRole === USER_ROLES.LMD_ADMIN
                    ? 'Department Email or ID'
                    : 'Inspector Email or ID'}
                </label>
                {selectedRole === USER_ROLES.BUSINESS && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('business.demo@maapsetu.demo');
                      setPassword('MaapSetu@2026');
                    }}
                    className="text-xs font-mono text-[#C87541] hover:underline font-semibold"
                  >
                    [Auto-Fill Demo]
                  </button>
                )}
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  selectedRole === USER_ROLES.BUSINESS
                    ? 'business.demo@maapsetu.demo'
                    : selectedRole === USER_ROLES.LMD_ADMIN
                    ? 'lmd01@maapsetu.demo'
                    : 'lmo01@maapsetu.demo'
                }
                required
                className="w-full bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 font-mono focus:outline-none focus:border-[#0B315B] focus:ring-1 focus:ring-[#0B315B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 min-h-[44px] pr-10 text-sm text-slate-800 focus:outline-none focus:border-[#0B315B] focus:ring-1 focus:ring-[#0B315B]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 min-h-[44px] rounded-sm bg-[#0B315B] hover:bg-[#082240] text-white font-semibold text-sm transition-colors border border-[#0B315B] flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            </button>

            <div className="pt-1">
              {selectedRole === USER_ROLES.BUSINESS && (
                <p className="text-center text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setLoginSuccess(false);
                      setSignUpSuccess(false);
                      setErrorMsg('');
                    }}
                    className="text-[#C87541] font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              )}

              {selectedRole !== USER_ROLES.BUSINESS && (
                <p className="text-center text-[11px] font-mono text-slate-500">
                  Authorized LMD / GATC Personnel Only • Statutory Audit Active
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  </div>
);
};
