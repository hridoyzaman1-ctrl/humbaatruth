import { supabase } from './supabase';
import { AdminRole, AdminUser } from '@/types/admin';

// Extend AdminUser to match DB schema if needed
export interface ExtendedAdminUser extends AdminUser {
    createdAt: Date;
    isActive: boolean;
}

export const userService = {
    async authenticate(email: string, password?: string): Promise<ExtendedAdminUser | null> {
        try {
            const lowerEmail = email.toLowerCase();

            // Check Supabase 'authors' table
            // Note: In a real flow, checking password here via DB query is WRONG for Auth.
            // But we keep this method to return the Profile object AFTER Supabase Auth.
            const { data, error } = await supabase
                .from('authors')
                .select('*')
                .eq('email', lowerEmail)
                .maybeSingle();

            if (data) {
                return {
                    ...data,
                    isActive: true,
                    createdAt: new Date(data.created_at)
                } as ExtendedAdminUser;
            }

            return null;
        } catch (error) {
            console.error('Authentication exception:', error);
            return null;
        }
    },

    async updateProfile(userId: string, updates: Partial<AdminUser>) {
        const { error } = await supabase
            .from('authors')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
    },

    // ... Any other User Management methods can stay if they are pure DB operations
};
