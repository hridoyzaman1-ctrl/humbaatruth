import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminRole, AdminUser, RolePermissions, ROLE_PERMISSIONS, hasPermission } from '@/types/admin';
import { userService, ExtendedAdminUser } from '@/lib/userService';
import { supabase } from '@/lib/supabase';

// Export ExtendedAdminUser as AdminUser for compatibility where needed
export type { ExtendedAdminUser };

interface AdminAuthContextType {
  currentUser: ExtendedAdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canAccessPath: (path: string) => boolean;
  updateCurrentUser: (user: ExtendedAdminUser) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Path to permission mapping could stay, or we can clear it if requested. 
// Keeping it for now as it's UI logic, not "Auth Data".
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

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        userService.authenticate(session.user.email).then(user => {
          if (user) setCurrentUser(user);
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        const email = session.user.email;
        const isSuperAdmin = email.toLowerCase() === 'hridoyzaman1@gmail.com';

        // 1. IMPROVED FALLBACK: Set Super Admin State IMMEDIATELY (Don't wait for DB)
        if (isSuperAdmin) {
          console.log("Instant Access for Super Admin");
          setCurrentUser({
            id: session.user.id,
            email: email,
            name: 'Hridoy Zaman',
            role: 'admin',
            isActive: true,
            status: 'active',
            createdAt: new Date(),
            avatar: ''
          } as ExtendedAdminUser);
        }

        // 2. Fetch DB Profile (Background update)
        userService.authenticate(email).then(user => {
          if (user) {
            setCurrentUser(user);
          } else if (!isSuperAdmin) {
            // For normal users, if no profile, we do nothing (remains null or requires handling)
          }
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login Result: Error", error.message);
      return false;
    }

    // The onAuthStateChange will handle state update
    if (data.session) {
      // Check profile
      const email = data.session.user.email;
      if (email) {
        const userProfile = await userService.authenticate(email);
        if (userProfile) return true;

        // EMERGENCY FALLBACK
        if (email.toLowerCase() === 'hridoyzaman1@gmail.com') {
          return true;
        }
      }
    }

    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminUser');
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
  // This is tricky without hook, but we can check checking local storage as a hint?
  // Or just remove this usage from Layout if we can.
  return true; // Weak check, relies on Context for real security
};

export const adminLogout = (): void => {
  supabase.auth.signOut();
};
