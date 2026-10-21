import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loginRequest, resetPasswordRequest, signupRequest } from '@/api/auth';
import { setAuthToken, setUnauthorizedHandler } from '@/api/client';

const USER_KEY = 'auth_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
      setIsLoading(false);
    })();
  }, []);

  const logOut = useCallback(async () => {
    await setAuthToken(null);
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logOut();
      router.replace('/auth/login');
    });
    return () => setUnauthorizedHandler(null);
  }, [logOut, router]);

  const persistSession = useCallback(async (token: string, authUser: AuthUser) => {
    await setAuthToken(token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { token, user: authUser } = await signupRequest(name, email, password);
      await persistSession(token, authUser);
    },
    [persistSession]
  );

  const logIn = useCallback(
    async (email: string, password: string) => {
      const { token, user: authUser } = await loginRequest(email, password);
      await persistSession(token, authUser);
    },
    [persistSession]
  );

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    await resetPasswordRequest(email, newPassword);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signUp, logIn, logOut, resetPassword }),
    [user, isLoading, signUp, logIn, logOut, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
