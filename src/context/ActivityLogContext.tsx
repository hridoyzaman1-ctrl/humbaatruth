import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAdminAuth } from './AdminAuthContext';

export type ActivityAction = 
  | 'create' | 'update' | 'delete' | 'publish' | 'unpublish'
  | 'approve' | 'reject' | 'flag' | 'upload' | 'login' | 'logout'
  | 'reorder' | 'toggle' | 'submit_review' | 'bulk_delete';

export type ActivityResource = 
  | 'article' | 'comment' | 'media' | 'user' | 'category'
  | 'featured' | 'section' | 'menu' | 'job' | 'setting'
  | 'contact_info' | 'about_info' | 'editorial' | 'internship_application'
  | 'session';

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityAction;
  resource: ActivityResource;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  metadata?: Record<string, any>;
}

interface ActivityLogContextType {
  logs: ActivityLogEntry[];
  logActivity: (
    action: ActivityAction,
    resource: ActivityResource,
    options?: {
      resourceId?: string;
      resourceName?: string;
      details?: string;
      metadata?: Record<string, any>;
    }
  ) => void;
  clearLogs: () => void;
  getLogsByResource: (resource: ActivityResource) => ActivityLogEntry[];
  getLogsByUser: (userId: string) => ActivityLogEntry[];
  getRecentLogs: (limit?: number) => ActivityLogEntry[];
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

// Store logs in memory (in production, this would be persisted to database)
let globalLogs: ActivityLogEntry[] = [];

// Load initial logs from localStorage for persistence across page refreshes
try {
  const stored = localStorage.getItem('adminActivityLogs');
  if (stored) {
    globalLogs = JSON.parse(stored).map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  }
} catch {
  globalLogs = [];
}

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAdminAuth();
  const [logs, setLogs] = useState<ActivityLogEntry[]>(globalLogs);

  const logActivity = useCallback((
    action: ActivityAction,
    resource: ActivityResource,
    options?: {
      resourceId?: string;
      resourceName?: string;
      details?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    const entry: ActivityLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'Unknown User',
      userRole: currentUser?.role || 'unknown',
      action,
      resource,
      resourceId: options?.resourceId,
      resourceName: options?.resourceName,
      details: options?.details,
      metadata: options?.metadata,
    };

    globalLogs = [entry, ...globalLogs].slice(0, 500); // Keep last 500 logs
    setLogs(globalLogs);

    // Persist to localStorage
    try {
      localStorage.setItem('adminActivityLogs', JSON.stringify(globalLogs));
    } catch {
      // Storage full, clear old logs
      globalLogs = globalLogs.slice(0, 100);
      localStorage.setItem('adminActivityLogs', JSON.stringify(globalLogs));
    }
  }, [currentUser]);

  const clearLogs = useCallback(() => {
    globalLogs = [];
    setLogs([]);
    localStorage.removeItem('adminActivityLogs');
  }, []);

  const getLogsByResource = useCallback((resource: ActivityResource) => {
    return logs.filter(log => log.resource === resource);
  }, [logs]);

  const getLogsByUser = useCallback((userId: string) => {
    return logs.filter(log => log.userId === userId);
  }, [logs]);

  const getRecentLogs = useCallback((limit = 50) => {
    return logs.slice(0, limit);
  }, [logs]);

  return (
    <ActivityLogContext.Provider
      value={{
        logs,
        logActivity,
        clearLogs,
        getLogsByResource,
        getLogsByUser,
        getRecentLogs,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = (): ActivityLogContextType => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within ActivityLogProvider');
  }
  return context;
};

// Helper to format action for display
export const formatAction = (action: ActivityAction): string => {
  const actionLabels: Record<ActivityAction, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    publish: 'Published',
    unpublish: 'Unpublished',
    approve: 'Approved',
    reject: 'Rejected',
    flag: 'Flagged',
    upload: 'Uploaded',
    login: 'Logged in',
    logout: 'Logged out',
    reorder: 'Reordered',
    toggle: 'Toggled',
    submit_review: 'Submitted for review',
    bulk_delete: 'Bulk deleted',
  };
  return actionLabels[action] || action;
};

// Helper to format resource for display
export const formatResource = (resource: ActivityResource): string => {
  const resourceLabels: Record<ActivityResource, string> = {
    article: 'Article',
    comment: 'Comment',
    media: 'Media',
    user: 'User',
    category: 'Category',
    featured: 'Featured Item',
    section: 'Section',
    menu: 'Menu Item',
    job: 'Job Posting',
    setting: 'Setting',
    contact_info: 'Contact Info',
    about_info: 'About Info',
    editorial: 'Editorial',
    internship_application: 'Internship Application',
    session: 'Session',
  };
  return resourceLabels[resource] || resource;
};

// Get action color for badges
export const getActionColor = (action: ActivityAction): string => {
  const colors: Record<ActivityAction, string> = {
    create: 'bg-green-500/10 text-green-600 border-green-500/20',
    update: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    delete: 'bg-red-500/10 text-red-600 border-red-500/20',
    publish: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    unpublish: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    approve: 'bg-green-500/10 text-green-600 border-green-500/20',
    reject: 'bg-red-500/10 text-red-600 border-red-500/20',
    flag: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    upload: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    login: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    logout: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    reorder: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    toggle: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    submit_review: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    bulk_delete: 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return colors[action] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
};
