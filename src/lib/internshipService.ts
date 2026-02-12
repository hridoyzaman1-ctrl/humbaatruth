import { supabase } from './supabase';

// ===== Types =====
export interface InternshipBenefit {
    id: string;
    icon_name: string;
    title: string;
    description: string;
    sort_order: number;
}

export interface InternshipDepartment {
    id: string;
    icon_name: string;
    name: string;
    description: string;
    sort_order: number;
}

export interface InternshipFAQ {
    id: string;
    question: string;
    answer: string;
    sort_order: number;
}

export interface InternshipApplication {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    university: string;
    department: string;
    portfolio: string;
    cover_letter: string;
    cv_file_name?: string;
    cv_url?: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
    submitted_at: string;
}

export interface InternshipPageContent {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    whyJoinTitle: string;
    whyJoinDescription: string;
    departmentsTitle: string;
    formTitle: string;
    formDescription: string;
    faqTitle: string;
}

export interface InternshipSettings {
    acceptingApplications: boolean;
    showBannerOnHomepage: boolean;
    requirePortfolio: boolean;
    autoReplyEnabled: boolean;
    pageContent: InternshipPageContent;
}

const DEFAULT_PAGE_CONTENT: InternshipPageContent = {
    heroTitle: 'Launch Your Journalism Career',
    heroSubtitle: 'Now Accepting Applications',
    heroDescription: 'Join TruthLens as an intern and gain real-world experience in authentic, fact-based journalism. Shape stories that matter.',
    whyJoinTitle: 'Why Intern at TruthLens?',
    whyJoinDescription: 'We believe in nurturing the next generation of journalists with meaningful experiences and genuine career opportunities.',
    departmentsTitle: 'Internship Departments',
    formTitle: 'Apply for Internship',
    formDescription: 'Fill out the form below to start your journey with TruthLens.',
    faqTitle: 'Frequently Asked Questions'
};

const DEFAULT_SETTINGS: InternshipSettings = {
    acceptingApplications: true,
    showBannerOnHomepage: true,
    requirePortfolio: false,
    autoReplyEnabled: true,
    pageContent: DEFAULT_PAGE_CONTENT
};

// ===== Benefits CRUD =====
export const getBenefits = async (): Promise<InternshipBenefit[]> => {
    const { data, error } = await supabase
        .from('internship_benefits')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) { console.error('Error fetching benefits:', error); return []; }
    return data || [];
};

export const upsertBenefit = async (benefit: Partial<InternshipBenefit>): Promise<InternshipBenefit | null> => {
    const { data, error } = await supabase
        .from('internship_benefits')
        .upsert({
            ...(benefit.id ? { id: benefit.id } : {}),
            icon_name: benefit.icon_name || 'Star',
            title: benefit.title,
            description: benefit.description,
            sort_order: benefit.sort_order || 0
        })
        .select()
        .single();
    if (error) { console.error('Error saving benefit:', error); throw error; }
    window.dispatchEvent(new Event('internshipDataUpdated'));
    return data;
};

export const deleteBenefit = async (id: string): Promise<void> => {
    const { error } = await supabase.from('internship_benefits').delete().eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('internshipDataUpdated'));
};

// ===== Departments CRUD =====
export const getDepartments = async (): Promise<InternshipDepartment[]> => {
    const { data, error } = await supabase
        .from('internship_departments')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) { console.error('Error fetching departments:', error); return []; }
    return data || [];
};

export const upsertDepartment = async (dept: Partial<InternshipDepartment>): Promise<InternshipDepartment | null> => {
    const { data, error } = await supabase
        .from('internship_departments')
        .upsert({
            ...(dept.id ? { id: dept.id } : {}),
            icon_name: dept.icon_name || 'Briefcase',
            name: dept.name,
            description: dept.description,
            sort_order: dept.sort_order || 0
        })
        .select()
        .single();
    if (error) { console.error('Error saving department:', error); throw error; }
    window.dispatchEvent(new Event('internshipDataUpdated'));
    return data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
    const { error } = await supabase.from('internship_departments').delete().eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('internshipDataUpdated'));
};

// ===== FAQs CRUD =====
export const getFAQs = async (): Promise<InternshipFAQ[]> => {
    const { data, error } = await supabase
        .from('internship_faqs')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) { console.error('Error fetching FAQs:', error); return []; }
    return data || [];
};

export const upsertFAQ = async (faq: Partial<InternshipFAQ>): Promise<InternshipFAQ | null> => {
    const { data, error } = await supabase
        .from('internship_faqs')
        .upsert({
            ...(faq.id ? { id: faq.id } : {}),
            question: faq.question,
            answer: faq.answer,
            sort_order: faq.sort_order || 0
        })
        .select()
        .single();
    if (error) { console.error('Error saving FAQ:', error); throw error; }
    window.dispatchEvent(new Event('internshipDataUpdated'));
    return data;
};

export const deleteFAQ = async (id: string): Promise<void> => {
    const { error } = await supabase.from('internship_faqs').delete().eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('internshipDataUpdated'));
};

// ===== Applications CRUD =====
export const getApplications = async (): Promise<InternshipApplication[]> => {
    const { data, error } = await supabase
        .from('internship_applications')
        .select('*')
        .order('submitted_at', { ascending: false });
    if (error) { console.error('Error fetching applications:', error); return []; }
    return data || [];
};

export const submitApplication = async (
    app: Omit<InternshipApplication, 'id' | 'status' | 'submitted_at'>
): Promise<InternshipApplication | null> => {
    const { data, error } = await supabase
        .from('internship_applications')
        .insert({
            full_name: app.full_name,
            email: app.email,
            phone: app.phone,
            university: app.university,
            department: app.department,
            portfolio: app.portfolio,
            cover_letter: app.cover_letter,
            cv_file_name: app.cv_file_name || null,
            cv_url: app.cv_url || null,
            status: 'pending'
        })
        .select()
        .single();
    if (error) { console.error('Error submitting application:', error); throw error; }
    window.dispatchEvent(new Event('internshipApplicationsUpdated'));
    return data;
};

export const updateApplicationStatus = async (id: string, status: InternshipApplication['status']): Promise<void> => {
    const { error } = await supabase
        .from('internship_applications')
        .update({ status })
        .eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('internshipApplicationsUpdated'));
};

export const deleteApplication = async (id: string): Promise<void> => {
    const { error } = await supabase.from('internship_applications').delete().eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new Event('internshipApplicationsUpdated'));
};

// ===== Internship Settings (stored in site_settings.internship_settings) =====
export const getInternshipSettings = async (): Promise<InternshipSettings> => {
    const { data, error } = await supabase
        .from('site_settings')
        .select('internship_settings')
        .eq('id', 1)
        .single();
    if (error || !data?.internship_settings) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...data.internship_settings };
};

export const saveInternshipSettings = async (settings: InternshipSettings): Promise<void> => {
    await supabase
        .from('site_settings')
        .update({ internship_settings: settings })
        .eq('id', 1);
    window.dispatchEvent(new Event('internshipSettingsUpdated'));
};

// ===== Page Content (stored inside internship_settings) =====
export const getPageContent = async (): Promise<InternshipPageContent> => {
    const settings = await getInternshipSettings();
    return settings.pageContent || DEFAULT_PAGE_CONTENT;
};

export const savePageContent = async (content: InternshipPageContent): Promise<void> => {
    const settings = await getInternshipSettings();
    settings.pageContent = content;
    await saveInternshipSettings(settings);
};

export { DEFAULT_SETTINGS, DEFAULT_PAGE_CONTENT };
