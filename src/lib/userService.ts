import { supabase } from './supabase';
import { AdminUser } from '@/types/admin';

export interface ExtendedAdminUser extends AdminUser {
    address?: string;
    phone?: string;
    bio?: string;
}

export const userService = {
    getUsers: async (): Promise<ExtendedAdminUser[]> => {
        const { data, error } = await supabase
            .from('authors')
            .select('*');

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data.map((u: any) => ({
            ...u,
            isActive: u.isActive ?? true,
            createdAt: new Date(u.created_at)
        })) as ExtendedAdminUser[];
    },

    authenticate: async (email: string, password: string): Promise<ExtendedAdminUser | null> => {
        const lowerEmail = email.toLowerCase();

        // Mock passwords for demo accounts
        const mockPasswords: Record<string, string> = {
            'admin@truthlens.com': 'admin123',
            'editor@truthlens.com': 'editor123',
            'author@truthlens.com': 'author123',
            'journalist@truthlens.com': 'journalist123'
        };

        try {
            // First check Supabase
            const { data, error } = await supabase
                .from('authors')
                .select('*')
                .eq('email', lowerEmail)
                .maybeSingle();

            if (data) {
                if (mockPasswords[lowerEmail] === password) {
                    return {
                        ...data,
                        isActive: true,
                        createdAt: new Date(data.created_at)
                    } as ExtendedAdminUser;
                }
                return null;
            }

            // Fallback: If DB query returns nothing, check if it's a demo account
            if (mockPasswords[lowerEmail] === password) {
                console.log('Using demo fallback for:', lowerEmail);
                const demoUsers: Record<string, any> = {
                    'admin@truthlens.com': { id: 'demo-admin', name: 'System Admin', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
                    'editor@truthlens.com': { id: 'demo-editor', name: 'News Editor', role: 'editor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor' },
                    'author@truthlens.com': { id: 'demo-author', name: 'Senior Author', role: 'author', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=author' },
                    'journalist@truthlens.com': { id: 'demo-journalist', name: 'Lead Journalist', role: 'journalist', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=journalist' }
                };

                const demoInfo = demoUsers[lowerEmail];
                if (demoInfo) {
                    return {
                        ...demoInfo,
                        email: lowerEmail,
                        isActive: true,
                        createdAt: new Date()
                    } as ExtendedAdminUser;
                }
            }

            return null;
        } catch (error) {
            console.error('Authentication exception:', error);
            // Even on error, allow demo accounts if password matches
            if (mockPasswords[lowerEmail] === password) {
                return {
                    id: 'error-fallback',
                    name: 'Demo User',
                    role: 'admin',
                    email: lowerEmail,
                    isActive: true,
                    createdAt: new Date()
                } as ExtendedAdminUser;
            }
            return null;
        }
    },

    updateProfile: async (userId: string, updates: Partial<ExtendedAdminUser>) => {
        const { data, error } = await supabase
            .from('authors')
            .update({
                name: updates.name,
                avatar: updates.avatar,
                bio: updates.bio,
                role: updates.role,
                // address and phone would need columns if we want them persisted
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
