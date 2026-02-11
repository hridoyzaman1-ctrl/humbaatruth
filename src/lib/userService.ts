import { AdminUser } from '@/types/admin';

// Default mock users
const DEFAULT_USERS: Record<string, { password: string; user: Omit<AdminUser, 'id'> & { address?: string; phone?: string; bio?: string } }> = {
    'admin@truthlens.com': {
        password: 'admin123',
        user: {
            name: 'Admin User',
            email: 'admin@truthlens.com',
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            address: '123 Admin St, Tech City',
            phone: '+1 234 567 8900',
            bio: 'System Administrator'
        },
    },
    'editor@truthlens.com': {
        password: 'editor123',
        user: {
            name: 'Sarah Editor',
            email: 'editor@truthlens.com',
            role: 'editor',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            isActive: true,
            createdAt: new Date('2024-02-01'),
            address: '456 Editing Ln, Publisher City',
            phone: '+1 987 654 3210',
            bio: 'Senior Editor'
        },
    },
    'author@truthlens.com': {
        password: 'author123',
        user: {
            name: 'John Author',
            email: 'author@truthlens.com',
            role: 'author',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            isActive: true,
            createdAt: new Date('2024-03-01'),
            address: '789 Writer Blvd, Novel Town',
            phone: '+1 555 123 4567',
            bio: 'Lead Author'
        },
    },
    'journalist@truthlens.com': {
        password: 'journalist123',
        user: {
            name: 'Emily Journalist',
            email: 'journalist@truthlens.com',
            role: 'journalist',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            isActive: true,
            createdAt: new Date('2024-03-15'),
            address: '321 Press Ave, Media City',
            phone: '+1 444 555 6666',
            bio: 'Investigative Journalist'
        },
    },
};

const STORAGE_KEY = 'truthlens_users_v1';

export interface ExtendedAdminUser extends AdminUser {
    address?: string;
    phone?: string;
    bio?: string;
}

export const userService = {
    // Initialize users if not present
    init: () => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            const usersList: Record<string, any> = {};
            Object.entries(DEFAULT_USERS).forEach(([email, data]) => {
                usersList[email] = {
                    ...data,
                    user: {
                        ...data.user,
                        id: email.toLowerCase().replace(/[^a-z0-9]/g, ''),
                    }
                };
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(usersList));
        }
    },

    getUsers: (): Record<string, any> => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    saveUsers: (users: Record<string, any>) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    },

    authenticate: (email: string, password: string) => {
        const users = userService.getUsers();
        const userEntry = users[email.toLowerCase()];

        if (userEntry && userEntry.password === password && userEntry.user.isActive) {
            return userEntry.user as ExtendedAdminUser;
        }
        return null;
    },

    updateProfile: (userId: string, updates: Partial<ExtendedAdminUser>) => {
        const users = userService.getUsers();
        const email = Object.keys(users).find(k => users[k].user.id === userId);

        if (email) {
            users[email].user = { ...users[email].user, ...updates };
            userService.saveUsers(users);
            return users[email].user as ExtendedAdminUser;
        }
        return null;
    }
};

// Initialize immediately
userService.init();
