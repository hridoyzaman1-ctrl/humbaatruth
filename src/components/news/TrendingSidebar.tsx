import { useState, useEffect, useCallback } from 'react';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { TrendingUp, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getSectionsSettings } from '@/lib/settingsService';

// Default sections definition for fallback
const defaultSections = [
  { id: 'trending', name: 'Trending Now', enabled: true, order: 5, maxArticles: 5, selectedArticleIds: [], showOnHomepage: true }
];

export const TrendingSidebar = () => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    setArticlesList(getArticles());
  }, []);

  // Load data and simulate minimal loading state
  useEffect(() => {
    fetchData();
    window.addEventListener('articlesUpdated', fetchData);
    window.addEventListener('sectionsSettingsUpdated', fetchData);

    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('articlesUpdated', fetchData);
      window.removeEventListener('sectionsSettingsUpdated', fetchData);
    };
  }, [fetchData]);

  // Get trending section settings
  const sections = getSectionsSettings(defaultSections as any);
  const trendingSection = sections.find(s => s.id === 'trending');

  // If we have selected articles in settings, use those. Otherwise fallback to top viewed.
  let trendingArticles: Article[] = [];
  if (trendingSection && trendingSection.selectedArticleIds.length > 0) {
    trendingArticles = trendingSection.selectedArticleIds
      .map(id => articlesList.find(a => a.id === id))
      .filter((a): a is Article => !!a);
  } else {
    // Fallback: sort by views
    trendingArticles = [...articlesList]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-4 border border-border">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-4 border border-border">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
        <TrendingUp className="h-5 w-5 text-accent" />
        <h3 className="font-display text-lg font-bold text-foreground">Trending Now</h3>
      </div>

      <div className="space-y-1">
        {trendingArticles.map((article, index) => (
          <div key={article.id} className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {index + 1}
            </span>
            <ArticleCard article={article} variant="compact" />
          </div>
        ))}
      </div>
    </div>
  );
};
