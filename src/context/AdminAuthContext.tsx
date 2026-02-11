import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminRole, AdminUser, RolePermissions, ROLE_PERMISSIONS, hasPermission } from '@/types/admin';
import { userService, ExtendedAdminUser } from '@/lib/userService';

// Export ExtendedAdminUser as AdminUser for compatibility where needed, or just extend the type
export type { ExtendedAdminUser };

interface AdminAuthContextType {
  currentUser: ExtendedAdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => boolean;
  logout: () => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canAccessPath: (path: string) => boolean;
  updateCurrentUser: (user: ExtendedAdminUser) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Path to permission mapping
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
  '/admin/profile': 'always', // Allow profile access
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedAdminUser | null>(null);

  // Load user from storage on mount
  useEffect(() => {
    // userService.init() is called in the module, so users should be ready
    const storedUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.createdAt = new Date(parsed.createdAt);
        // Refresh from "DB" to get latest updates if they changed in another session
        // But for local single-user this is fine. Ideally we fetch fresh from userService
        const freshUser = userService.authenticate(parsed.email, 'admin123'); // Hack: we don't have password here. 
        // Better: just use storedUser, but if we want to reflect updates from other tabs we'd need event listeners.
        // For simplicity, rely on storedUser but re-save on updates.
        setCurrentUser(parsed);
      } catch {
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminUser');
      }
    }
  }, []);

  const login = useCallback((email: string, password: string, rememberMe = false): boolean => {
    const user = userService.authenticate(email, password);

    if (user) {
      setCurrentUser(user);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('adminUser', JSON.stringify(user));
      storage.setItem('adminAuth', JSON.stringify({ isAuthenticated: true, timestamp: Date.now() }));

      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminUser');
    localStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuth');
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
    // Persist to DB
    userService.updateProfile(user.id, user);
    // Update State
    setCurrentUser(user);
    // Update Session
    const storage = localStorage.getItem('adminUser') ? localStorage : sessionStorage;
    storage.setItem('adminUser', JSON.stringify(user));
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

// Export for backward compatibility with AdminLogin
export const isAdminAuthenticated = (): boolean => {
  const storedUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
  return !!storedUser;
};

export const adminLogout = (): void => {
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminUser');
  localStorage.removeItem('adminAuth');
  sessionStorage.removeItem('adminAuth');
};
