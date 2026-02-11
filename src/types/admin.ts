// Admin Role Types
export type AdminRole = 'admin' | 'editor' | 'author' | 'journalist';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

// Permission definitions for each role
export interface RolePermissions {
  // Dashboard
  viewFullDashboard: boolean;
  viewOwnStats: boolean;
  
  // Articles
  createArticles: boolean;
  editOwnArticles: boolean;
  editAllArticles: boolean;
  deleteOwnArticles: boolean;
  deleteAllArticles: boolean;
  publishArticles: boolean; // Can directly publish without review
  reviewArticles: boolean;  // Can approve/reject pending articles
  setBreakingNews: boolean;
  setFeatured: boolean;
  
  // Featured & Sections (homepage management)
  manageFeatured: boolean;
  manageSections: boolean;
  
  // Editorial
  manageEditorial: boolean;
  
  // Header Menu
  manageMenu: boolean;
  
  // Comments
  viewAllComments: boolean;
  moderateComments: boolean;
  
  // Contact Info & Site Settings
  manageContactInfo: boolean;
  manageSettings: boolean;
  
  // Categories
  manageCategories: boolean;
  
  // Media
  uploadMedia: boolean;
  viewAllMedia: boolean;
  deleteOwnMedia: boolean;
  deleteAllMedia: boolean;
  
  // Users
  manageUsers: boolean;
  
  // Jobs
  manageJobs: boolean;
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  admin: {
    viewFullDashboard: true,
    viewOwnStats: true,
    createArticles: true,
    editOwnArticles: true,
    editAllArticles: true,
    deleteOwnArticles: true,
    deleteAllArticles: true,
    publishArticles: true,
    reviewArticles: true,
    setBreakingNews: true,
    setFeatured: true,
    manageFeatured: true,
    manageSections: true,
    manageEditorial: true,
    manageMenu: true,
    viewAllComments: true,
    moderateComments: true,
    manageContactInfo: true,
    manageSettings: true,
    manageCategories: true,
    uploadMedia: true,
    viewAllMedia: true,
    deleteOwnMedia: true,
    deleteAllMedia: true,
    manageUsers: true,
    manageJobs: true,
  },
  editor: {
    viewFullDashboard: true,
    viewOwnStats: true,
    createArticles: true,
    editOwnArticles: true,
    editAllArticles: true,
    deleteOwnArticles: true,
    deleteAllArticles: false,
    publishArticles: true,
    reviewArticles: true,
    setBreakingNews: false,
    setFeatured: false,
    manageFeatured: false,
    manageSections: false,
    manageEditorial: false,
    manageMenu: false,
    viewAllComments: true,
    moderateComments: true,
    manageContactInfo: false,
    manageSettings: false,
    manageCategories: false,
    uploadMedia: true,
    viewAllMedia: true,
    deleteOwnMedia: true,
    deleteAllMedia: false,
    manageUsers: false,
    manageJobs: false,
  },
  author: {
    viewFullDashboard: false,
    viewOwnStats: true,
    createArticles: true,
    editOwnArticles: true,
    editAllArticles: false,
    deleteOwnArticles: true,
    deleteAllArticles: false,
    publishArticles: false, // Must submit for review
    reviewArticles: false,
    setBreakingNews: false,
    setFeatured: false,
    manageFeatured: false,
    manageSections: false,
    manageEditorial: false,
    manageMenu: false,
    viewAllComments: false,
    moderateComments: false,
    manageContactInfo: false,
    manageSettings: false,
    manageCategories: false,
    uploadMedia: true,
    viewAllMedia: false,
    deleteOwnMedia: true,
    deleteAllMedia: false,
    manageUsers: false,
    manageJobs: false,
  },
  journalist: {
    viewFullDashboard: false,
    viewOwnStats: true,
    createArticles: true,
    editOwnArticles: true,
    editAllArticles: false,
    deleteOwnArticles: true,
    deleteAllArticles: false,
    publishArticles: false, // Must submit for review
    reviewArticles: false,
    setBreakingNews: false,
    setFeatured: false,
    manageFeatured: false,
    manageSections: false,
    manageEditorial: false,
    manageMenu: false,
    viewAllComments: false,
    moderateComments: false,
    manageContactInfo: false,
    manageSettings: false,
    manageCategories: false,
    uploadMedia: true,
    viewAllMedia: false,
    deleteOwnMedia: true,
    deleteAllMedia: false,
    manageUsers: false,
    manageJobs: false,
  },
};

// Navigation item configuration with required permissions
export interface AdminNavItem {
  icon: string;
  label: string;
  path: string;
  requiredPermission?: keyof RolePermissions;
  showForRoles?: AdminRole[];
}

// Helper function to check if a role has a specific permission
export const hasPermission = (role: AdminRole, permission: keyof RolePermissions): boolean => {
  return ROLE_PERMISSIONS[role][permission];
};

// Role display names and colors
export const ROLE_DISPLAY: Record<AdminRole, { label: string; color: string }> = {
  admin: { label: 'Administrator', color: 'bg-red-500' },
  editor: { label: 'Editor', color: 'bg-blue-500' },
  author: { label: 'Author', color: 'bg-green-500' },
  journalist: { label: 'Journalist', color: 'bg-purple-500' },
};
