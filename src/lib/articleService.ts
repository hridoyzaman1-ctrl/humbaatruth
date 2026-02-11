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

    return data as Article[];
};

export const saveArticles = async (articles: Article[]) => {
    // Note: This function as a bulk 'save all' is inefficient for SQL.
    // In a real database, we save individual records.
    // However, to keep compatibility with the current dashboard logic, 
    // we will implement a 'upsert' for individual articles in a separate function.
    console.warn('saveArticles (bulk) is deprecated. Use upsertArticle instead.');
};

export const upsertArticle = async (article: Partial<Article>) => {
    const { data, error } = await supabase
        .from('articles')
        .upsert({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            category_id: article.category,
            author_id: article.author?.id,
            featured_image: article.featuredImage,
            video_url: article.videoUrl,
            has_video: article.hasVideo,
            show_on_homepage: article.showOnHomepage,
            tags: article.tags,
            is_breaking: article.isBreaking,
            is_featured: article.isFeatured,
            status: article.status,
            published_at: article.publishedAt,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
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
    return data as Article;
};

export const incrementArticleViews = async (id: string) => {
    // Atomic increment
    const { error } = await supabase.rpc('increment_views', { article_id: id });
    if (error) console.error('Error incrementing views:', error);
};
