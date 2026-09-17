import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const USER_ROLES = {
  BUSINESS: 'business',
  LMD_ADMIN: 'lmd',
  OFFICER: 'officer'
};

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('maapsetu_role') || null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
      return null;
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
      return null;
    }
  };

  const applyProfile = (authUser, profile) => {
    if (profile) {
      setUser({ ...authUser, ...profile });
      setCurrentRole(profile.role);
      localStorage.setItem('maapsetu_role', profile.role);
    } else {
      setUser(authUser);
      setCurrentRole(null);
      localStorage.removeItem('maapsetu_role');
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
          if (!cancelled) applyProfile(existing.user, profile);
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
        const profile = await loadUserProfile(newSession.user);
        if (!cancelled) {
          applyProfile(newSession.user, profile);
          setLoading(false);
        }
      } else {
        setUser(null);
        setCurrentRole(null);
        localStorage.removeItem('maapsetu_role');
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // ── ACTIONS (SYNCHRONOUS STATE RESOLUTION) ────────────────────────────────────
  // loginAsRole fully resolves profile and sets state BEFORE returning to prevent route race conditions
  const loginAsRole = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setSession(data.session);
      let profile = null;
      if (data.user) {
        profile = await loadUserProfile(data.user);
        applyProfile(data.user, profile);
      }
      return { ...data, profile };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email, password, profileData) => {
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (!email || !email.includes('@')) throw new Error('A valid email address is required.');

    setLoading(true);
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

        // ONLY attempt profile insert if we have an active authenticated session.
        // If email confirmation is required, session is null, so an unauthenticated call
        // would fail with 42501 RLS error. The profile is safely persisted in auth metadata
        // and will be created seamlessly on first login via loadUserProfile().
        if (data.session) {
          const { data: savedProfile } = await supabase
            .from('profiles')
            .upsert(profilePayload, { onConflict: 'id' })
            .select()
            .single();

          profile = savedProfile || profilePayload;
          setSession(data.session);
          applyProfile(data.user, profile);
        } else {
          profile = profilePayload;
        }
      }

      return { ...data, profile };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentRole(null);
    setSession(null);
    localStorage.removeItem('maapsetu_role');
  };

  // ── CONTEXT VALUE ────────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider value={{ currentRole, user, session, loading, loginAsRole, registerUser, logout, USER_ROLES }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
