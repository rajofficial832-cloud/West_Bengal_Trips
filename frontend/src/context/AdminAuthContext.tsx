import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { adminLoginRequest } from '@/api/admin';
import { setAdminToken, setAdminUnauthorizedHandler } from '@/api/adminClient';

const ADMIN_USER_KEY = 'admin_auth_user';

export interface AdminUserSession {
  id: string;
  name: string;
  email: string;
}

interface AdminAuthContextValue {
  admin: AdminUserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(ADMIN_USER_KEY);
      if (raw) {
        setAdmin(JSON.parse(raw) as AdminUserSession);
      }
      setIsLoading(false);
    })();
  }, []);

  const logout = useCallback(async () => {
    await setAdminToken(null);
    await AsyncStorage.removeItem(ADMIN_USER_KEY);
    setAdmin(null);
  }, []);

  useEffect(() => {
    setAdminUnauthorizedHandler(() => {
      logout();
      router.replace('/admin/login');
    });
    return () => setAdminUnauthorizedHandler(null);
  }, [logout, router]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, admin: adminUser } = await adminLoginRequest(email, password);
    await setAdminToken(token);
    await AsyncStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
    setAdmin(adminUser);
  }, []);

  const value = useMemo(() => ({ admin, isLoading, login, logout }), [admin, isLoading, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// Redirects to the admin login screen once session restore finishes and no admin is signed in.
export function useRequireAdmin(): AdminUserSession | null {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace('/admin/login');
    }
  }, [isLoading, admin, router]);

  return admin;
}
