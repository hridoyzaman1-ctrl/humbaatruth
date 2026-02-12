import { supabase } from './supabase';
import { Article } from '@/types/news';

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

    return (data || []).map(article => ({
        ...article,
        customAuthor: article.custom_author,
        author: article.author || { id: 'unknown', name: 'Unknown Author', email: '', role: 'author', avatar: '', bio: '' },
        publishedAt: new Date(article.published_at || article.publishedAt),
        createdAt: new Date(article.created_at || article.createdAt),
        updatedAt: new Date(article.updated_at || article.updatedAt)
    })) as Article[];
};

export const saveArticles = async (articles: Article[]) => {
    console.warn('saveArticles (bulk) is deprecated. Use upsertArticle instead.');
};

// Map frontend status to DB-compatible status
const mapStatusForDb = (status: string): string => {
    // DB only allows: 'draft', 'published', 'scheduled'
    // Frontend may use: 'pending_review', 'rejected', etc.
    if (status === 'pending_review' || status === 'rejected') {
        return 'draft'; // Save as draft in DB
    }
    return status || 'draft';
};

export const upsertArticle = async (article: Partial<Article>) => {
    // Build payload — only include id if editing
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
    return {
        ...data,
        customAuthor: data.custom_author,
        publishedAt: new Date(data.published_at || data.publishedAt),
        createdAt: new Date(data.created_at || data.createdAt),
        updatedAt: new Date(data.updated_at || data.updatedAt)
    } as Article;
};

export const incrementArticleViews = async (id: string) => {
    // Atomic increment
    const { error } = await supabase.rpc('increment_views', { article_id: id });
    if (error) console.error('Error incrementing views:', error);
};
