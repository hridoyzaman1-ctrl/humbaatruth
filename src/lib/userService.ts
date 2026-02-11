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
        // Note: For a commercial app, use Supabase Auth.
        // This is a bridge using the authors table.
        const { data, error } = await supabase
            .from('authors')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !data) return null;

        // In the mock app, passwords aren't stored in Supabase yet.
        // We'll assume the same mock passwords for now if the user hasn't set up Supabase Auth.
        const mockPasswords: Record<string, string> = {
            'admin@truthlens.com': 'admin123',
            'editor@truthlens.com': 'editor123',
            'author@truthlens.com': 'author123',
            'journalist@truthlens.com': 'journalist123'
        };

        if (mockPasswords[email.toLowerCase()] === password) {
            return {
                ...data,
                isActive: true,
                createdAt: new Date(data.created_at)
            } as ExtendedAdminUser;
        }

        return null;
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
