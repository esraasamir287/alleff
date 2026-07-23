import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, setRememberMe } from '../lib/supabaseClient';
import {
  fetchStudentProfile,
  type StudentProfile,
} from '../lib/profileApi';

type AuthError = 'network' | 'expired' | null;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: StudentProfile | null;
  loading: boolean;
  profileLoading: boolean;
  authError: AuthError;
  needsProfileCompletion: boolean;
  logout: () => Promise<void>;
  retryProfile: () => void;
  refreshProfile: () => Promise<void>;
}

const defaultContext: AuthContextValue = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  profileLoading: false,
  authError: null,
  needsProfileCompletion: false,
  logout: async () => {},
  retryProfile: () => {},
  refreshProfile: async () => {},
};

export const AuthContext = createContext<AuthContextValue>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError>(null);
  const [retryCount, setRetryCount] = useState(0);

  const userInitiatedLogout = useRef(false);
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // 1 — Restore session on mount + single auth-state listener.
  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });

    // onAuthStateChange callback must stay synchronous — no awaited Supabase
    // calls inside (deadlock guard). Profile loading is handled in a separate
    // effect that watches the session user.
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT') {
        const wasAuthenticated = !!sessionRef.current;
        setSession(null);
        setProfile(null);
        setProfileLoading(false);
        setLoading(false);
        if (wasAuthenticated && !userInitiatedLogout.current) {
          setAuthError('expired');
        }
        userInitiatedLogout.current = false;
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        setAuthError(null);
      } else {
        setSession(newSession);
        setLoading(false);
        setAuthError(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 2 — Load profile when the session user changes. Separate effect to avoid
  // the onAuthStateChange deadlock. Re-runs on retry.
  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let mounted = true;
    setProfileLoading(true);
    setAuthError(null);

    fetchStudentProfile(userId)
      .then((p) => {
        if (!mounted) return;
        setProfile(p);
        setProfileLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthError('network');
        setProfileLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId, retryCount]);

  // 3 — Cross-tab synchronization. When another tab logs out (removes the
  // token from localStorage) or logs in, update our state.
  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.key.includes('-auth-token')) return;

      if (e.newValue === null) {
        // Token removed in another tab — treat as user-initiated logout so
        // we don't show the "expired" error message.
        userInitiatedLogout.current = true;
        setSession(null);
        setProfile(null);
        setProfileLoading(false);
      } else {
        // Token added/changed in another tab — re-read the session.
        supabase.auth.getSession().then(({ data }) => {
          setSession(data.session);
        });
      }
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const logout = useCallback(async () => {
    userInitiatedLogout.current = true;
    setRememberMe(false);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setAuthError(null);
  }, []);

  const retryProfile = useCallback(() => {
    setAuthError(null);
    setRetryCount((c) => c + 1);
  }, []);

  const refreshProfile = useCallback(async () => {
    const uid = sessionRef.current?.user?.id;
    if (!uid) return;
    setProfileLoading(true);
    try {
      const p = await fetchStudentProfile(uid);
      setProfile(p);
    } catch {
      // non-fatal — profile state stays as-is
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const needsProfileCompletion = !!profile && profile.studySystem === null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      profileLoading,
      authError,
      needsProfileCompletion,
      logout,
      retryProfile,
      refreshProfile,
    }),
    [
      session,
      profile,
      loading,
      profileLoading,
      authError,
      needsProfileCompletion,
      logout,
      retryProfile,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
