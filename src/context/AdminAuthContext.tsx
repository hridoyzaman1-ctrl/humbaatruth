import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminRole, AdminUser, RolePermissions, ROLE_PERMISSIONS, hasPermission } from '@/types/admin';
import { userService, ExtendedAdminUser } from '@/lib/userService';
import { supabase } from '@/lib/supabase';

// Export ExtendedAdminUser as AdminUser for compatibility where needed
export type { ExtendedAdminUser };

interface AdminAuthContextType {
  currentUser: ExtendedAdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canAccessPath: (path: string) => boolean;
  updateCurrentUser: (user: ExtendedAdminUser) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const PATH_PERMISSIONS: Record<string, keyof RolePermissions | 'always'> = {
  '/admin': 'always',
  '/admin/featured': 'manageFeatured',
  '/admin/sections': 'manageSections',
  '/admin/menu': 'manageMenu',
  '/admin/editorial': 'manageEditorial',
  '/admin/articles': 'always',
  '/admin/comments': 'viewAllComments',
  '/admin/contact-info': 'manageContactInfo',
  '/admin/categories': 'manageCategories',
  '/admin/media': 'uploadMedia',
  '/admin/users': 'manageUsers',
  '/admin/jobs': 'manageJobs',
  '/admin/settings': 'manageSettings',
  '/admin/profile': 'always',
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async (sessionUserEmail: string | undefined) => {
    if (!sessionUserEmail) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const user = await userService.authenticate(sessionUserEmail);
      setCurrentUser(user);
    } catch (error) {
      console.error("Auth init error:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      initAuth(session?.user?.email);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      initAuth(session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, [initAuth]);

  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login Result: Error", error.message);
      setIsLoading(false);
      return false;
    }

    // onAuthStateChange handles state
    return true;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminUser');
    setIsLoading(false);
  }, []);

  const checkPermission = useCallback((permission: keyof RolePermissions): boolean => {
    if (!currentUser) return false;
    return hasPermission(currentUser.role, permission);
  }, [currentUser]);

  const canAccessPath = useCallback((path: string): boolean => {
    if (!currentUser) return false;
    const permission = PATH_PERMISSIONS[path];
    if (!permission) return true;
    if (permission === 'always') return true;
    return hasPermission(currentUser.role, permission);
  }, [currentUser]);

  const updateCurrentUser = useCallback((user: ExtendedAdminUser) => {
    userService.updateProfile(user.id, user);
    setCurrentUser(user);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        hasPermission: checkPermission,
        canAccessPath,
        updateCurrentUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

// Export for backward compatibility 
export const isAdminAuthenticated = (): boolean => {
  const adminUser = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
  return !!adminUser;
};

export const adminLogout = (): void => {
  supabase.auth.signOut();
};
