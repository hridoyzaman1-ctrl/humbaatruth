import { getCategories } from './settingsService';

// Shared category color utility — used across admin and frontend
// Uses a hash-based approach so new categories automatically get colors
const PREDEFINED_COLORS: Record<string, string> = {
    national: 'bg-red-600',
    international: 'bg-blue-600',
    economy: 'bg-emerald-600',
    politics: 'bg-purple-600',
    sports: 'bg-orange-600',
    entertainment: 'bg-pink-600',
    technology: 'bg-cyan-600',
    editorial: 'bg-amber-700',
    'untold-stories': 'bg-violet-600',
    environment: 'bg-green-600',
    culture: 'bg-rose-600',
    society: 'bg-teal-600',
};

// Fallback palette for unknown / new categories (cycles through)
const FALLBACK_COLORS = [
    'bg-indigo-600', 'bg-lime-600', 'bg-sky-600', 'bg-fuchsia-600',
    'bg-yellow-600', 'bg-slate-600', 'bg-red-500', 'bg-blue-500',
];

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

export function getCategoryColor(category: string): string {
    if (!category) return 'bg-gray-500';
    const lower = category.toLowerCase();
    if (PREDEFINED_COLORS[lower]) return PREDEFINED_COLORS[lower];
    return FALLBACK_COLORS[hashCode(lower) % FALLBACK_COLORS.length];
}

// Category item type for use across the app
export interface CategoryItem {
    id: string;
    name: string;
    description: string;
}

// Fetch categories from Supabase (with fallback)
let cachedCategories: CategoryItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function fetchCategories(): Promise<CategoryItem[]> {
    const now = Date.now();
    if (cachedCategories && (now - cacheTimestamp) < CACHE_TTL) {
        return cachedCategories;
    }
    try {
        const data = await getCategories();
        if (data && data.length > 0) {
            cachedCategories = data as CategoryItem[];
            cacheTimestamp = now;
            return cachedCategories;
        }
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }
    // Return empty array if DB fetch fails — individual pages can show a message
    return cachedCategories || [];
}

// Invalidate cache (call after creating/editing/deleting a category)
export function invalidateCategoryCache() {
    cachedCategories = null;
    cacheTimestamp = 0;
}
