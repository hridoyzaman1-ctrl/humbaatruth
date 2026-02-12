import { supabase } from './supabase';
import { MenuItem } from '@/types/news';

// Featured Settings Types
export interface FeaturedSettings {
    breakingNewsIds: string[];
    heroFeaturedIds: string[];
    heroSideArticleIds: string[];
    maxBreakingNews: number;
    maxHeroArticles: number;
    breakingAutoSwipe?: boolean;
    autoSwipeInterval?: number;
    heroAutoSwipe?: boolean;
}

// Section Config Types
export interface SectionConfig {
    id: string;
    name: string;
    icon?: any;
    enabled: boolean;
    order: number;
    maxArticles: number;
    selectedArticleIds: string[];
    showOnHomepage: boolean;
    category?: string;
}

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

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    isVisible: boolean;
}

export interface ContactInfoConfig {
    email: string;
    phone: string;
    address: string;
    officeHours: string;
}

// --- Generic Settings Fetcher ---
const getSiteData = async () => {
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.error('Error fetching site settings:', error);
        return null;
    }
    return data;
};

// --- Featured Settings ---
export const getFeaturedSettings = async (): Promise<FeaturedSettings | null> => {
    const data = await getSiteData();
    return data?.hero_settings || null;
};

export const saveFeaturedSettings = async (settings: FeaturedSettings) => {
    await supabase
        .from('site_settings')
        .update({ hero_settings: settings })
        .eq('id', 1);
    window.dispatchEvent(new Event('featuredSettingsUpdated'));
};

// --- Sections Settings ---
export const getSectionsSettings = async (defaultSections: SectionConfig[]): Promise<SectionConfig[]> => {
    const data = await getSiteData();
    const saved = data?.sections_settings || [];
    if (saved.length === 0) return defaultSections;

    return defaultSections.map(def => {
        const s = saved.find((item: any) => item.id === def.id);
        return s ? { ...def, ...s, icon: def.icon } : def;
    }).sort((a, b) => a.order - b.order);
};

export const saveSectionsSettings = async (sections: SectionConfig[]) => {
    const dataToSave = sections.map(({ icon, ...rest }) => rest);
    await supabase
        .from('site_settings')
        .update({ sections_settings: dataToSave })
        .eq('id', 1);
    window.dispatchEvent(new Event('sectionsSettingsUpdated'));
};

// --- Menu Settings ---
export const getMenuSettings = async (defaultMenu: MenuItem[]): Promise<MenuItem[]> => {
    const data = await getSiteData();
    return data?.menu_settings?.length > 0 ? data.menu_settings : defaultMenu;
};

export const saveMenuSettings = async (menuItems: MenuItem[]) => {
    await supabase
        .from('site_settings')
        .update({ menu_settings: menuItems })
        .eq('id', 1);
    window.dispatchEvent(new Event('menuSettingsUpdated'));
};

// --- Site Settings ---
export const getSiteSettings = async (): Promise<SiteSettingsConfig | null> => {
    const data = await getSiteData();
    if (!data) return null;
    return {
        siteName: data.site_name,
        tagline: data.tagline,
        siteDescription: data.site_description,
        contactEmail: data.contact_email,
        // Other boolean/string configs could be stored in a separate 'config' JSONB or as columns
        ...data.config // assuming we add a general config column
    } as SiteSettingsConfig;
};

export const saveSiteSettings = async (settings: SiteSettingsConfig) => {
    const { siteName, tagline, siteDescription, contactEmail, ...config } = settings;
    await supabase
        .from('site_settings')
        .update({
            site_name: siteName,
            tagline,
            site_description: siteDescription,
            contact_email: contactEmail,
            config // Store the rest as JSON
        })
        .eq('id', 1);
    window.dispatchEvent(new Event('siteSettingsUpdated'));
};

// --- Social Links ---
export const getSocialLinks = async (defaultLinks: SocialLink[]): Promise<SocialLink[]> => {
    const data = await getSiteData();
    return data?.social_links?.length > 0 ? data.social_links : defaultLinks;
};

export const saveSocialLinks = async (links: SocialLink[]) => {
    await supabase
        .from('site_settings')
        .update({ social_links: links })
        .eq('id', 1);
    window.dispatchEvent(new Event('socialLinksUpdated'));
};

// --- Categories ---
export const getCategories = async (): Promise<any[]> => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) return [];
    return data;
};

export const saveCategories = async (categories: any[]) => {
    // Note: Categories in SQL should be upserted individually for resilience
    for (const cat of categories) {
        await supabase.from('categories').upsert(cat);
    }
    window.dispatchEvent(new Event('categoriesUpdated'));
};

// --- Contact Info ---
export const getContactInfo = async (defaultInfo: ContactInfoConfig): Promise<ContactInfoConfig> => {
    const data = await getSiteData();
    return data?.contact_info || defaultInfo;
};

export const saveContactInfo = async (info: ContactInfoConfig) => {
    await supabase
        .from('site_settings')
        .update({ contact_info: info })
        .eq('id', 1);
};


