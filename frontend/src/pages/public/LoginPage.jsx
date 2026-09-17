import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Scale, Building2, UserCheck, ShieldCheck, ArrowRight, Lock, Sparkles, ArrowUpRight, ChevronDown, CheckCircle2, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
    if (user && currentRole) {
      const homes = { business: '/business', lmd: '/lmd', officer: '/officer' };
      const home = homes[currentRole] || '/';
      const redirectPath = searchParams.get('redirect');
      const dest = (redirectPath && redirectPath.startsWith(`/${currentRole}`)) ? redirectPath : home;
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
    <div className="w-full min-h-[85vh] bg-[#FDF9F6] text-[#003943] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#003943]/15 space-y-7 relative overflow-hidden">
        {/* Top Decorative Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#003943] via-[#00959C] to-[#02B7BF]" />

        {/* Card Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-[#003943] text-[#02B7BF] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Scale className="w-8 h-8 text-[#02B7BF]" />
            </div>
            <div className="flex items-baseline text-left">
              <span className="text-3xl font-extrabold tracking-tight text-[#003943] font-serif">Maap</span>
              <span className="text-3xl font-extrabold tracking-tight text-[#00959C] font-serif italic">Setu</span>
            </div>
          </Link>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E0F5F6] border border-[#00959C]/30 text-[#00959C] text-xs font-bold uppercase tracking-wider">
              {isSignUp ? <UserPlus className="w-3.5 h-3.5 text-[#00959C]" /> : <Lock className="w-3.5 h-3.5 text-[#00959C]" />}
              <span>{isSignUp ? 'Business Account Registration' : 'Official Login Portal'}</span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003943] tracking-tight pt-1">
            {isSignUp ? 'Create Business Account' : 'Portal Access'}
          </h2>
          <p className="text-xs sm:text-sm text-[#003943]/70 max-w-sm mx-auto">
            {isSignUp
              ? 'Register as an authorized instrument owner to submit verification applications.'
              : 'Select your user role to enter the Legal Metrology Verification System.'}
          </p>
        </div>

        {/* Role Selector Tabs (Visible during Sign In) */}
        {!isSignUp && (
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/70">
              Select User Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect(USER_ROLES.BUSINESS)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  selectedRole === USER_ROLES.BUSINESS
                    ? 'border-[#00959C] bg-[#003943] text-white font-bold shadow-md ring-2 ring-[#00959C]/30'
                    : 'border-[#003943]/15 bg-[#FDF9F6] text-[#003943] hover:border-[#00959C] hover:bg-white'
                }`}
              >
                <Building2 className={`w-6 h-6 ${selectedRole === USER_ROLES.BUSINESS ? 'text-[#02B7BF]' : 'text-[#00959C]'}`} />
                <span className="text-xs sm:text-sm">Business</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect(USER_ROLES.LMD_ADMIN)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  selectedRole === USER_ROLES.LMD_ADMIN
                    ? 'border-[#00959C] bg-[#003943] text-white font-bold shadow-md ring-2 ring-[#00959C]/30'
                    : 'border-[#003943]/15 bg-[#FDF9F6] text-[#003943] hover:border-[#00959C] hover:bg-white'
                }`}
              >
                <ShieldCheck className={`w-6 h-6 ${selectedRole === USER_ROLES.LMD_ADMIN ? 'text-[#02B7BF]' : 'text-[#00959C]'}`} />
                <span className="text-xs sm:text-sm">LMD Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect(USER_ROLES.OFFICER)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  selectedRole === USER_ROLES.OFFICER
                    ? 'border-[#00959C] bg-[#003943] text-white font-bold shadow-md ring-2 ring-[#00959C]/30'
                    : 'border-[#003943]/15 bg-[#FDF9F6] text-[#003943] hover:border-[#00959C] hover:bg-white'
                }`}
              >
                <UserCheck className={`w-6 h-6 ${selectedRole === USER_ROLES.OFFICER ? 'text-[#02B7BF]' : 'text-[#00959C]'}`} />
                <span className="text-xs sm:text-sm">LMO / GATC</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Alert Banners */}
        {signUpSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p>Business Account Registered Successfully!</p>
              <p className="text-[11px] font-normal text-emerald-700 mt-0.5">
                If a verification link was sent to your email, please confirm it, then sign in below.
              </p>
            </div>
          </div>
        )}

        {loginSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Login Successful!
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-2xl text-red-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM SECTION */}
        {isSignUp ? (
          /* BUSINESS SIGN UP FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                Full Name / Authorized Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikramaditya Mehta"
                required
                className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="e.g. v.mehta@apexlogistics.in"
                required
                className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                required
                className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 pr-12 text-sm font-mono font-bold text-[#003943] focus:outline-none focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#003943]/60 hover:text-[#003943] focus:outline-none p-1 rounded-md"
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  >
                    {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 pr-12 text-sm font-mono font-bold text-[#003943] focus:outline-none focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#003943]/60 hover:text-[#003943] focus:outline-none p-1 rounded-md"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#003943] hover:bg-[#002B33] text-white font-extrabold text-base sm:text-lg transition-all shadow-lg flex items-center justify-center gap-3 group mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Create Business Account'}</span>
              <div className="w-7 h-7 rounded-full bg-[#02B7BF] text-[#003943] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>

            {/* Back to Sign In Link */}
            <p className="text-center text-xs sm:text-sm text-[#003943]/70 font-medium pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setLoginSuccess(false);
                  setSignUpSuccess(false);
                  setErrorMsg('');
                }}
                className="text-[#00959C] font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        ) : (
          /* REGULAR PORTAL LOGIN FORM */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  {selectedRole === USER_ROLES.BUSINESS
                    ? 'Email / Mobile Number'
                    : selectedRole === USER_ROLES.LMD_ADMIN
                    ? 'Government Email / Employee ID'
                    : 'Official Email / Officer ID'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                {selectedRole === USER_ROLES.BUSINESS && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('business.demo@maapsetu.demo');
                      setPassword('MaapSetu@2026');
                    }}
                    className="text-[11px] font-bold text-[#00959C] hover:underline"
                  >
                    Use Demo Account
                  </button>
                )}
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  selectedRole === USER_ROLES.BUSINESS
                    ? 'e.g. v.mehta@apexlogistics.in or +91 98765 43210'
                    : selectedRole === USER_ROLES.LMD_ADMIN
                    ? 'e.g. admin.ngp@maapsetu.gov.in or EMP-LMD-9041'
                    : 'e.g. r.sharma.lmo@maapsetu.gov.in or OFFICER-NGP-442'
                }
                required
                className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 pr-12 text-sm font-mono font-bold text-[#003943] focus:outline-none focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#003943]/60 hover:text-[#003943] focus:outline-none p-1 rounded-md"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#003943] hover:bg-[#002B33] text-white font-extrabold text-base sm:text-lg transition-all shadow-lg flex items-center justify-center gap-3 group"
            >
              <span>{loading ? 'Authenticating...' : 'Enter the Portal'}</span>
              <div className="w-7 h-7 rounded-full bg-[#02B7BF] text-[#003943] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>

            {/* ROLE SPECIFIC FOOTER GUIDANCE TEXT */}
            <div className="pt-2">
              {selectedRole === USER_ROLES.BUSINESS && (
                <p className="text-center text-xs sm:text-sm text-[#003943]/70 font-medium">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setLoginSuccess(false);
                      setSignUpSuccess(false);
                      setErrorMsg('');
                    }}
                    className="text-[#00959C] font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              )}

              {selectedRole === USER_ROLES.LMD_ADMIN && (
                <p className="text-center text-xs sm:text-sm text-[#003943]/70 font-medium">
                  Need access? <span className="font-bold text-[#003943]">Contact your department administrator.</span>
                </p>
              )}

              {selectedRole === USER_ROLES.OFFICER && (
                <p className="text-center text-xs sm:text-sm text-[#003943]/70 font-medium">
                  Need access? <span className="font-bold text-[#003943]">Contact LMD Administrator.</span>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
