import { Article } from '@/types/news';
import { articles as initialArticles } from '@/data/mockData';

const STORAGE_KEY = 'truthlens_articles';

export const getArticles = (): Article[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            // Merge stored articles with initial structure if needed, 
            // but for now, we assume stored state is the truth.
            // We need to convert date strings back to Date objects
            const parsed = JSON.parse(stored);
            return parsed.map((a: any) => ({
                ...a,
                publishedAt: new Date(a.publishedAt),
                createdAt: new Date(a.createdAt),
                updatedAt: new Date(a.updatedAt)
            }));
        }
    } catch (error) {
        console.error('Error loading articles from storage:', error);
    }

    // If no storage or error, return initial mock data
    return initialArticles;
};

export const saveArticles = (articles: Article[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        // Dispatch a custom event so other components can listen for updates
        window.dispatchEvent(new Event('articlesUpdated'));
    } catch (error) {
        console.error('Error saving articles to storage:', error);
    }
};

export const getArticleBySlug = (slug: string): Article | undefined => {
    const articles = getArticles();
    return articles.find(a => a.slug === slug);
};

export const getArticleById = (id: string): Article | undefined => {
    const articles = getArticles();
    return articles.find(a => a.id === id);
};

export const incrementArticleViews = (id: string) => {
    const articles = getArticles();
    const updated = articles.map(a => {
        if (a.id === id) {
            return { ...a, views: (a.views || 0) + 1 };
        }
        return a;
    });
    saveArticles(updated);
};
