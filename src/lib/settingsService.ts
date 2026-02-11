import { MenuItem } from '@/types/news';

// Featured Settings Types
export interface FeaturedSettings {
    breakingNewsIds: string[];
    heroFeaturedIds: string[];
    heroSideArticleIds: string[]; // Articles on the right side of hero
    maxBreakingNews: number;
    maxHeroArticles: number;
    breakingAutoSwipe?: boolean;
    autoSwipeInterval?: number;
    heroAutoSwipe?: boolean;
}

// Section Config Types (matching AdminSections.tsx)
export interface SectionConfig {
    id: string;
    name: string;
    icon?: any; // We can't persist React nodes directly in JSON, we'll handle this mapping in the component
    enabled: boolean;
    order: number;
    maxArticles: number;
    selectedArticleIds: string[];
    showOnHomepage: boolean;
    category?: string;
}

// Storage Keys
const FEATURED_SETTINGS_KEY = 'truthlens_featured_settings';
const SECTIONS_SETTINGS_KEY = 'truthlens_sections_settings';
const MENU_SETTINGS_KEY = 'truthlens_menu_settings';

// Default Data (Fallbacks)
export const defaultFeaturedSettings: FeaturedSettings = {
    breakingNewsIds: ['1', '2', '5'],
    heroFeaturedIds: ['1', '3', '4', '7'],
    heroSideArticleIds: ['2', '5', '6', '8'], // Default side articles
    maxBreakingNews: 5,
    maxHeroArticles: 5,
    breakingAutoSwipe: true,
    autoSwipeInterval: 5000,
    heroAutoSwipe: true
};

// --- Featured Settings ---
export const getFeaturedSettings = (): FeaturedSettings => {
    const data = localStorage.getItem(FEATURED_SETTINGS_KEY);
    if (!data) return defaultFeaturedSettings;
    try {
        const parsed = JSON.parse(data);
        // Merge with default to ensure all keys exist if schema changes
        return { ...defaultFeaturedSettings, ...parsed };
    } catch (error) {
        console.error('Error parsing featured settings', error);
        return defaultFeaturedSettings;
    }
};

export const saveFeaturedSettings = (settings: FeaturedSettings) => {
    localStorage.setItem(FEATURED_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('featuredSettingsUpdated'));
};

// --- Sections Settings ---
// We only persist the "data" parts of sections. The icons and static definitions stay in code, 
// but we need to merge the persisted state (enabled, order, selectedArticleIds) with the code definitions.
export const saveSectionsSettings = (sections: SectionConfig[]) => {
    // Strip out the 'icon' property before saving as it causes circular reference/JSON issues
    const dataToSave = sections.map(({ icon, ...rest }) => rest);
    localStorage.setItem(SECTIONS_SETTINGS_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new Event('sectionsSettingsUpdated'));
};

export const getSectionsSettings = (defaultSections: SectionConfig[]): SectionConfig[] => {
    const data = localStorage.getItem(SECTIONS_SETTINGS_KEY);
    if (!data) return defaultSections;
    try {
        const savedSections = JSON.parse(data) as Partial<SectionConfig>[];

        // Merge saved data with default structure (to keep icons and new sections)
        // We try to match by ID.
        // If a section is in defaults but not in saved, we keep default.
        // If a section is in saved but not defaults (e.g. removed legacy), we might ignore it or keep it if dynamic.
        // Assuming sections are mostly static in definition but dynamic in state:

        // Create a map of saved sections for quick lookup
        const savedMap = new Map(savedSections.map(s => [s.id, s]));

        // Map over defaults and apply saved overrides
        let merged = defaultSections.map(def => {
            const saved = savedMap.get(def.id);
            if (saved) {
                return { ...def, ...saved, icon: def.icon }; // Restore icon from default
            }
            return def;
        });

        // If we want to persist order, we need to respect the saved order.
        // We can sort 'merged' based on the saved order.
        // Or if the saved list has the full order, we can follow that.

        // Let's assume the saved list is the master for order if all IDs are present.
        // A simpler approach: use the saved array as the base, but re-attach icons from defaults.
        // But if we added a NEW section in code (in defaults), it wouldn't be in saved.
        // So mapping over defaults is safer for schema updates, but we need to respect saved 'order'.

        if (savedSections.length > 0) {
            // Sort merged based on saved order if available, or keep default order
            // It's effectively sorting by the 'order' property which we just merged in.
            merged.sort((a, b) => a.order - b.order);
        }

        return merged;
    } catch (error) {
        console.error('Error parsing sections settings', error);
        return defaultSections;
    }
};

// --- Menu Settings ---
export const getMenuSettings = (defaultMenu: MenuItem[]): MenuItem[] => {
    const data = localStorage.getItem(MENU_SETTINGS_KEY);
    if (!data) return defaultMenu;
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing menu settings', error);
        return defaultMenu;
    }
};

export const saveMenuSettings = (menuItems: MenuItem[]) => {
    localStorage.setItem(MENU_SETTINGS_KEY, JSON.stringify(menuItems));
    // Dispatch event so Header can update if it listens (optional)
    window.dispatchEvent(new Event('menuSettingsUpdated'));
};

// --- Site Settings ---
const SITE_SETTINGS_KEY = 'truthlens_site_settings';
const SOCIAL_LINKS_KEY = 'truthlens_social_links';

export interface SiteSettingsConfig {
    siteName: string;
    tagline: string;
    siteDescription: string;
    contactEmail: string;
    enableComments: boolean;
    moderateComments: boolean;
    enableNewsletter: boolean;
    articlesPerPage: string;
    defaultCategory: string;
    timezone: string;
    dateFormat: string;
    maintenanceMode: boolean;
}

export const defaultSiteSettings: SiteSettingsConfig = {
    siteName: 'TruthLens',
    tagline: 'Authentic Stories. Unbiased Voices.',
    siteDescription: 'Your trusted source for fact-based journalism.',
    contactEmail: 'contact@truthlens.com',
    enableComments: true,
    moderateComments: true,
    enableNewsletter: true,
    articlesPerPage: '10',
    defaultCategory: 'national',
    timezone: 'UTC',
    dateFormat: 'MMM d, yyyy',
    maintenanceMode: false
};

export const getSiteSettings = (): SiteSettingsConfig => {
    const data = localStorage.getItem(SITE_SETTINGS_KEY);
    if (!data) return defaultSiteSettings;
    try {
        return { ...defaultSiteSettings, ...JSON.parse(data) };
    } catch {
        return defaultSiteSettings;
    }
};

export const saveSiteSettings = (settings: SiteSettingsConfig) => {
    localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('siteSettingsUpdated'));
};

// Social Links
export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    isVisible: boolean;
}

export const getSocialLinks = (defaultLinks: SocialLink[]): SocialLink[] => {
    const data = localStorage.getItem(SOCIAL_LINKS_KEY);
    if (!data) return defaultLinks;
    try {
        return JSON.parse(data);
    } catch {
        return defaultLinks;
    }
};

export const saveSocialLinks = (links: SocialLink[]) => {
    localStorage.setItem(SOCIAL_LINKS_KEY, JSON.stringify(links));
    window.dispatchEvent(new Event('socialLinksUpdated'));
};

// --- Categories ---
const CATEGORIES_KEY = 'truthlens_categories';

export interface CategoryConfig {
    id: string;
    name: string;
    description: string;
}

export const getCategories = (defaultCategories: CategoryConfig[]): CategoryConfig[] => {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) return defaultCategories;
    try {
        return JSON.parse(data);
    } catch {
        return defaultCategories;
    }
};

export const saveCategories = (categories: CategoryConfig[]) => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event('categoriesUpdated'));
};

// --- Contact Info ---
const CONTACT_INFO_KEY = 'truthlens_contact_info';

export interface ContactInfoConfig {
    email: string;
    phone: string;
    address: string;
    officeHours: string;
}

export const defaultContactInfo: ContactInfoConfig = {
    email: 'contact@truthlens.com',
    phone: '+1 (555) 123-4567',
    address: '123 News Street, Media City, MC 12345',
    officeHours: 'Mon-Fri 9:00 AM - 6:00 PM'
};

export const getContactInfo = (): ContactInfoConfig => {
    const data = localStorage.getItem(CONTACT_INFO_KEY);
    if (!data) return defaultContactInfo;
    try {
        return { ...defaultContactInfo, ...JSON.parse(data) };
    } catch {
        return defaultContactInfo;
    }
};

export const saveContactInfo = (info: ContactInfoConfig) => {
    localStorage.setItem(CONTACT_INFO_KEY, JSON.stringify(info));
    window.dispatchEvent(new Event('contactInfoUpdated'));
};

// --- Internships ---
const INTERNSHIPS_KEY = 'truthlens_internships';

export interface InternshipConfig {
    id: string;
    title: string;
    department: string;
    duration: string;
    description: string;
    requirements: string[];
    isActive: boolean;
}

export const getInternships = (defaultData: InternshipConfig[]): InternshipConfig[] => {
    const data = localStorage.getItem(INTERNSHIPS_KEY);
    if (!data) return defaultData;
    try {
        return JSON.parse(data);
    } catch {
        return defaultData;
    }
};

export const saveInternships = (internships: InternshipConfig[]) => {
    localStorage.setItem(INTERNSHIPS_KEY, JSON.stringify(internships));
    window.dispatchEvent(new Event('internshipsUpdated'));
};

// --- Jobs ---
const JOBS_KEY = 'truthlens_jobs';

export interface JobConfig {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    isActive: boolean;
    postedAt: string;
}

export const getJobs = (defaultData: JobConfig[]): JobConfig[] => {
    const data = localStorage.getItem(JOBS_KEY);
    if (!data) return defaultData;
    try {
        return JSON.parse(data);
    } catch {
        return defaultData;
    }
};

export const saveJobs = (jobs: JobConfig[]) => {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    window.dispatchEvent(new Event('jobsUpdated'));
};


