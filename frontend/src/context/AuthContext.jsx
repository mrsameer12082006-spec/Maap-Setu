import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const USER_ROLES = {
  BUSINESS: 'business',
  LMD_ADMIN: 'lmd',
  OFFICER: 'officer'
};

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tracks which user ID has already had its profile resolved synchronously
  // (either by bootstrap or by loginAsRole). When onAuthStateChange fires
  // for the same user, we skip the redundant DB round-trip.
  const resolvedUserIdRef = useRef(null);

  // ── CORE: load (and if missing, auto-create) a user's profile ──────────────
  // authUser = the object from supabase.auth (has .id, .email, .user_metadata)
  // Self-healing: if the profile row is missing for any reason
  // (RLS blocked insert during signup, or deleted in reset),
  // we recreate it from auth user metadata.
  const loadUserProfile = async (authUser) => {
    if (!authUser?.id) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!error && profile) return profile;

      if (error?.code === 'PGRST116' || !profile) {
        // Profile row is missing. Auto-create it from auth user metadata.
        const meta = authUser.user_metadata || {};
        const role = meta.role || 'business';

        const profilePayload = {
          id: authUser.id,
          email: authUser.email?.toLowerCase().trim() ?? '',
          name: meta.name?.trim() || authUser.email?.split('@')[0] || 'User',
          phone: meta.phone?.trim() || null,
          role,
          organization: meta.organization?.trim() || null,
          is_active: true,
        };

        const { data: newProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' })
          .select()
          .single();

        if (upsertError) {
          console.warn('Profile auto-create failed (using in-memory fallback):', upsertError);
          return profilePayload;
        }

        console.info('Profile auto-created successfully for:', authUser.email);
        return newProfile;
      }

      console.error('Error fetching profile:', error);
      const meta = authUser?.user_metadata || {};
      const fallbackRole = meta.role || localStorage.getItem('metrika_role') || localStorage.getItem('maapsetu_role') || 'business';
      return { id: authUser.id, email: authUser.email, name: meta.name || 'User', role: fallbackRole, is_active: true };
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
      const meta = authUser?.user_metadata || {};
      const fallbackRole = meta.role || localStorage.getItem('metrika_role') || localStorage.getItem('maapsetu_role') || 'business';
      return { id: authUser?.id, email: authUser?.email, name: meta.name || 'User', role: fallbackRole, is_active: true };
    }
  };

  const applyProfile = (authUser, profile) => {
    if (profile && profile.role) {
      setUser({ ...authUser, ...profile });
      setCurrentRole(profile.role);
      localStorage.setItem('metrika_role', profile.role);
    } else {
      const fallbackRole = authUser?.user_metadata?.role || localStorage.getItem('metrika_role') || localStorage.getItem('maapsetu_role') || 'business';
      setUser(authUser);
      setCurrentRole(fallbackRole);
      localStorage.setItem('metrika_role', fallbackRole);
    }
  };

  // ── SESSION BOOTSTRAP ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const { data: { session: existing } } = await supabase.auth.getSession();
        if (cancelled) return;

        setSession(existing);
        if (existing?.user) {
          const profile = await loadUserProfile(existing.user);
          if (!cancelled) {
            applyProfile(existing.user, profile);
            resolvedUserIdRef.current = existing.user.id;
          }
        }
      } catch (e) {
        console.error('Auth bootstrap error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (cancelled) return;

      setSession(newSession);

      if (newSession?.user) {
        const uid = newSession.user.id;

        // If loginAsRole or bootstrap already fetched this user's profile,
        // skip the duplicate DB round-trip. This eliminates the double-fetch
        // that caused the loading spinner to flash a second time after login.
        if (uid === resolvedUserIdRef.current) {
          setLoading(false);
          return;
        }

        const profile = await loadUserProfile(newSession.user);
        if (!cancelled) {
          applyProfile(newSession.user, profile);
          resolvedUserIdRef.current = uid;
          setLoading(false);
        }
      } else {
        // Signed out
        setUser(null);
        setCurrentRole(null);
        resolvedUserIdRef.current = null;
        localStorage.removeItem('maapsetu_role');
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // ── DEMO SESSION FALLBACK ──────────────────────────────────────────────────
  const createDemoSession = (email) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    let role = 'business';
    let name = 'Vikramaditya Mehta';
    if (cleanEmail.includes('lmd')) {
      role = 'lmd';
      name = 'LMD Administrator Officer';
    } else if (cleanEmail.includes('lmo') || cleanEmail.includes('officer')) {
      role = 'officer';
      name = 'Inspector R. Sharma (LMO)';
    }

    const demoUser = {
      id: 'demo-user-' + role,
      email: email,
      name: name,
      role: role,
      roleTitle: role === 'lmd' ? 'LMD Administrator' : role === 'officer' ? 'LMO Inspection Officer' : 'Business Owner',
      user_metadata: { name, role }
    };

    const demoSession = {
      access_token: 'demo-token-' + role,
      user: demoUser
    };

    setSession(demoSession);
    setUser(demoUser);
    setCurrentRole(role);
    localStorage.setItem('metrika_role', role);
    localStorage.setItem('maapsetu_role', role);

    return { user: demoUser, session: demoSession, profile: demoUser };
  };

  // ── ACTIONS (SYNCHRONOUS STATE RESOLUTION) ────────────────────────────────────
  // loginAsRole fully resolves profile and sets state BEFORE returning to prevent route race conditions
  const loginAsRole = async (email, password) => {
    const isDemoAccount = email && (email.includes('demo') || email.includes('maapsetu') || email.includes('metrika'));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (isDemoAccount) {
          // If metrika.demo failed, try legacy maapsetu.demo account in Supabase
          if (email.includes('@metrika.demo')) {
            const legacyEmail = email.replace('@metrika.demo', '@maapsetu.demo');
            const { data: legacyData, error: legacyError } = await supabase.auth.signInWithPassword({ email: legacyEmail, password });
            if (!legacyError && legacyData?.session) {
              setSession(legacyData.session);
              let profile = await loadUserProfile(legacyData.user);
              applyProfile(legacyData.user, profile);
              resolvedUserIdRef.current = legacyData.user.id;
              return { ...legacyData, profile };
            }
          }
          // Fallback to seamless demo session
          return createDemoSession(email);
        }
        throw error;
      }

      setSession(data.session);
      let profile = null;
      if (data.user) {
        profile = await loadUserProfile(data.user);
        applyProfile(data.user, profile);
        // Mark this user resolved so the onAuthStateChange listener that
        // fires ~100ms after signIn skips the redundant profile fetch.
        resolvedUserIdRef.current = data.user.id;
      }
      return { ...data, profile };
    } catch (err) {
      if (isDemoAccount) {
        return createDemoSession(email);
      }
      throw err;
    }
  };

  const registerUser = async (email, password, profileData) => {
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (!email || !email.includes('@')) throw new Error('A valid email address is required.');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: profileData.name?.trim() || '',
            phone: profileData.phone?.trim() || null,
            role: 'business',
            organization: profileData.organization?.trim() || null,
          }
        }
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('user already exists')
        ) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        if (
          error.message?.toLowerCase().includes('rate limit') ||
          error.code === 'over_email_send_rate_limit'
        ) {
          throw new Error(
            'Supabase email confirmation rate limit reached (free tier allows ~3 emails/hour). In Supabase Dashboard -> Authentication -> Providers -> Email, turn OFF "Confirm email" to allow instant signups without sending confirmation emails.'
          );
        }
        throw error;
      }

      let profile = null;
      if (data?.user) {
        const profilePayload = {
          id: data.user.id,
          email: email.toLowerCase().trim(),
          name: profileData.name?.trim() || '',
          phone: profileData.phone?.trim() || null,
          role: 'business',
          organization: profileData.organization?.trim() || null,
          is_active: true,
        };

        // Only upsert to DB if we have an active session (email confirmation off).
        // If confirmation is required, session is null — the profile will be
        // auto-created from metadata on first login via loadUserProfile().
        if (data.session) {
          const { data: savedProfile } = await supabase
            .from('profiles')
            .upsert(profilePayload, { onConflict: 'id' })
            .select()
            .single();

          profile = savedProfile || profilePayload;
          setSession(data.session);
          applyProfile(data.user, profile);
          resolvedUserIdRef.current = data.user.id;
        } else {
          profile = profilePayload;
        }
      }

      return { ...data, profile };
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    resolvedUserIdRef.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setCurrentRole(null);
    setSession(null);
    localStorage.removeItem('metrika_role');
    localStorage.removeItem('maapsetu_role');
  };

  // ── CONTEXT VALUE ────────────────────────────────────────────────────────────
  // CRITICAL: Always render children — never gate the app tree on `loading`.
  // Gating with `{!loading && children}` was unmounting/remounting the entire
  // React tree each time loading toggled (button click → auth event → done),
  // which caused the blank white screen between login attempts.
  // ProtectedRoute handles the spinner inline using the `loading` flag.
  return (
    <AuthContext.Provider value={{ currentRole, user, session, loading, loginAsRole, registerUser, logout, USER_ROLES }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
