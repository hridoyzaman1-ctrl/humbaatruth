import { supabase } from './supabase';
import { Article } from '@/types/news';

// Safe date parser — never returns Invalid Date
const safeDate = (val: any): Date => {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
};

// Default author when none is set
const DEFAULT_AUTHOR = {
    id: 'unknown',
    name: 'Unknown Author',
    email: '',
    role: 'author' as const,
    avatar: '',
    bio: ''
};

// Map a raw Supabase row to a safe Article object
const mapArticle = (row: any): Article => ({
    id: row.id,
    title: row.title || 'Untitled',
    slug: row.slug || 'untitled',
    excerpt: row.excerpt || '',
    content: row.content || '',
    category: row.category_id || row.category || 'national',
    author: row.author || DEFAULT_AUTHOR,
    customAuthor: row.custom_author || null,
    featuredImage: row.featured_image || row.featuredImage || '',
    videoUrl: row.video_url || row.videoUrl || '',
    hasVideo: row.has_video || row.hasVideo || false,
    showOnHomepage: row.show_on_homepage ?? true,
    tags: row.tags || [],
    isBreaking: row.is_breaking || row.isBreaking || false,
    isFeatured: row.is_featured || row.isFeatured || false,
    status: row.status || 'draft',
    publishedAt: safeDate(row.published_at || row.publishedAt),
    createdAt: safeDate(row.created_at || row.createdAt),
    updatedAt: safeDate(row.updated_at || row.updatedAt),
    views: row.views || 0
});

export const getArticles = async (): Promise<Article[]> => {
    const { data, error } = await supabase
        .from('articles')
        .select(`
            *,
            author:authors(*)
        `)
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }

    return (data || []).map(mapArticle);
};

// Get only published articles for public frontend
export const getPublishedArticles = async (): Promise<Article[]> => {
    const { data, error } = await supabase
        .from('articles')
        .select(`
            *,
            author:authors(*)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching published articles:', error);
        return [];
    }

    return (data || []).map(mapArticle);
};

export const saveArticles = async (_articles: Article[]) => {
    console.warn('saveArticles (bulk) is deprecated. Use upsertArticle instead.');
};

// Map frontend status to DB — DB status column is TEXT, no constraint
const mapStatusForDb = (status: string): string => {
    return status || 'draft';
};

export const upsertArticle = async (article: Partial<Article>) => {
    const payload: Record<string, any> = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category_id: article.category,
        author_id: article.author?.id || null,
        featured_image: article.featuredImage,
        video_url: article.videoUrl || null,
        has_video: article.hasVideo || false,
        show_on_homepage: article.showOnHomepage ?? true,
        custom_author: article.customAuthor || null,
        tags: article.tags || [],
        is_breaking: article.isBreaking || false,
        is_featured: article.isFeatured || false,
        status: mapStatusForDb(article.status || 'draft'),
        published_at: article.publishedAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    // Include id only if editing an existing article
    if (article.id) {
        payload.id = article.id;
    }

    console.log('Upserting article payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase
        .from('articles')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        console.error('Supabase upsert error:', error.message, error.details, error.hint);
        throw error;
    }
    return data;
};

export const deleteArticle = async (id: string) => {
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
    const { data, error } = await supabase
        .from('articles')
        .select('*, author:authors(*)')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return mapArticle(data);
};

export const incrementArticleViews = async (id: string) => {
    const { error } = await supabase.rpc('increment_views', { article_id: id });
    if (error) console.error('Error incrementing views:', error);
};
