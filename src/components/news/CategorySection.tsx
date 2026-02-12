import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getPublishedArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { Category } from '@/types/news';
import { Button } from '@/components/ui/button';

interface CategorySectionProps {
  category: Category;
  title: string;
  showMore?: boolean;
  maxArticles?: number;
}

export const CategorySection = ({ category, title, showMore = true, maxArticles = 4 }: CategorySectionProps) => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const data = await getPublishedArticles();
      setArticlesList(data);
    };

    fetchArticles();

    // Listen for updates
    const handleUpdate = () => fetchArticles();
    window.addEventListener('articlesUpdated', handleUpdate);
    return () => window.removeEventListener('articlesUpdated', handleUpdate);
  }, []);

  const allCategoryArticles = articlesList.filter(a => a.category === category);
  const displayedArticles = allCategoryArticles.slice(0, maxArticles);
  const hasMoreArticles = allCategoryArticles.length > maxArticles;

  if (displayedArticles.length === 0) return null;

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between border-b-2 border-primary pb-2">
          <h2 className="font-display text-lg font-bold text-foreground md:text-xl">
            {title}
          </h2>
          {showMore && (
            <Link
              to={`/category/${category}`}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {displayedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="compact" />
          ))}
        </div>

        {/* View More Button — shown when there are more articles than the maxArticles limit */}
        {hasMoreArticles && showMore && (
          <div className="mt-6 text-center">
            <Link to={`/category/${category}`}>
              <Button variant="outline" className="px-8">
                View More {title} →
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
