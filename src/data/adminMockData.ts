import { AdminUser, FeaturedSettings } from '@/types/news';

export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'David Williams',
    email: 'david@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
    role: 'admin',
    isActive: true,
    permissions: ['all'],
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2026-01-14T08:00:00')
  },
  {
    id: 'admin-2',
    name: 'Sarah Mitchell',
    email: 'sarah@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    role: 'editor',
    isActive: true,
    permissions: ['articles.manage', 'categories.manage', 'media.manage', 'breaking.manage'],
    createdAt: new Date('2024-03-15'),
    lastLogin: new Date('2026-01-14T07:30:00')
  },
  {
    id: 'admin-3',
    name: 'James Chen',
    email: 'james@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    role: 'journalist',
    isActive: true,
    permissions: ['articles.create', 'articles.edit', 'media.upload'],
    createdAt: new Date('2024-06-20'),
    lastLogin: new Date('2026-01-13T16:00:00')
  },
  {
    id: 'admin-4',
    name: 'Amira Hassan',
    email: 'amira@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    role: 'journalist',
    isActive: true,
    permissions: ['articles.create', 'articles.edit', 'media.upload'],
    createdAt: new Date('2024-07-10'),
    lastLogin: new Date('2026-01-14T06:00:00')
  },
  {
    id: 'admin-5',
    name: 'Michael Roberts',
    email: 'michael@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    role: 'author',
    isActive: true,
    permissions: ['articles.create', 'articles.edit'],
    createdAt: new Date('2024-09-05'),
    lastLogin: new Date('2026-01-12T14:00:00')
  },
  {
    id: 'admin-6',
    name: 'Jessica Park',
    email: 'jessica@truthlens.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    role: 'author',
    isActive: false,
    permissions: ['articles.create'],
    createdAt: new Date('2024-10-01'),
    lastLogin: new Date('2025-12-20T10:00:00')
  }
];

export const featuredSettings: FeaturedSettings = {
  breakingNewsIds: ['1', '2', '5', '10', '13'],
  heroFeaturedIds: ['1', '3', '4', '7', '10', '13'],
  maxBreakingNews: 5,
  maxHeroArticles: 6,
  autoSwipeInterval: 5000,
  breakingAutoSwipe: true,
  heroAutoSwipe: true
};

export const rolePermissions: Record<string, string[]> = {
  admin: [
    'all',
    'users.manage',
    'users.create',
    'users.delete',
    'settings.manage',
    'breaking.manage',
    'hero.manage'
  ],
  editor: [
    'articles.manage',
    'articles.publish',
    'categories.manage',
    'media.manage',
    'breaking.manage',
    'hero.manage',
    'comments.moderate'
  ],
  journalist: [
    'articles.create',
    'articles.edit',
    'media.upload',
    'comments.view'
  ],
  author: [
    'articles.create',
    'articles.edit'
  ],
  reporter: [
    'articles.create',
    'articles.edit',
    'media.upload'
  ]
};
