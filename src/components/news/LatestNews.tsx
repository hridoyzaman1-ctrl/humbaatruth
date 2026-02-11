import { useState, useEffect } from 'react';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';

export const LatestNews = () => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  const fetchArticles = () => {
    setArticlesList(getArticles());
  };

  useEffect(() => {
    fetchArticles();
    window.addEventListener('articlesUpdated', fetchArticles);
    return () => window.removeEventListener('articlesUpdated', fetchArticles);
  }, []);

  const latestArticles = [...articlesList]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6);

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 font-display text-xl font-bold text-foreground md:text-2xl border-b-2 border-primary pb-2">
          Latest News
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
};
