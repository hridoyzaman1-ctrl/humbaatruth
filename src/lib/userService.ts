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

            // EMERGENCY HARDCODED SUPER ADMIN (Bypass DB entirely if needed)
            if (lowerEmail === 'hridoyzaman1@gmail.com') {
                console.log("Using Centralized Hardcoded Super Admin");
                // Attempt DB fetch first to get latest data (optional, but good if they update profile)
                const { data } = await supabase
                    .from('authors')
                    .select('*')
                    .eq('email', lowerEmail)
                    .maybeSingle();

                // If found, return it (ensure active)
                if (data) {
                    return { ...data, isActive: true, role: 'admin', status: 'active', createdAt: new Date(data.created_at) } as ExtendedAdminUser;
                }

                // If NOT found, return Mock
                return {
                    id: 'hardcoded-super-admin', // or force a known ID
                    email: lowerEmail,
                    name: 'Hridoy Zaman',
                    role: 'admin',
                    isActive: true,
                    status: 'active',
                    createdAt: new Date(),
                    avatar: ''
                } as ExtendedAdminUser;
            }

            // Normal Flow
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
