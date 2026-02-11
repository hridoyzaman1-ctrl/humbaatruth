import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { Newspaper, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSectionsSettings } from '@/lib/settingsService';

// Default sections definition for fallback
const defaultSections = [
  { id: 'editorial', name: 'Editorial & Opinion', enabled: true, order: 11, maxArticles: 4, selectedArticleIds: [], showOnHomepage: true, category: 'editorial' }
];

export const EditorialSection = () => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  const fetchData = useCallback(() => {
    setArticlesList(getArticles());
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener('articlesUpdated', fetchData);
    window.addEventListener('sectionsSettingsUpdated', fetchData);
    return () => {
      window.removeEventListener('articlesUpdated', fetchData);
      window.removeEventListener('sectionsSettingsUpdated', fetchData);
    };
  }, [fetchData]);

  // Get editorial section settings
  const sections = getSectionsSettings(defaultSections as any);
  const editorialSection = sections.find(s => s.id === 'editorial');

  // If we have selected articles in settings, use those. Otherwise fallback to category filter.
  let editorialArticles: Article[] = [];
  if (editorialSection && editorialSection.selectedArticleIds.length > 0) {
    editorialArticles = editorialSection.selectedArticleIds
      .map(id => articlesList.find(a => a.id === id))
      .filter((a): a is Article => !!a);
  } else {
    // Fallback: filter by editorial category
    editorialArticles = articlesList.filter(a => a.category === 'editorial').slice(0, 4);
  }

  const mainEditorial = editorialArticles[0];
  const sideEditorials = editorialArticles.slice(1, 4);

  if (editorialArticles.length === 0) return null;

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Pen className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
              Editorial & Opinion
            </h2>
          </div>
          <Link to="/category/editorial">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Editorial */}
          {mainEditorial && (
            <Link
              to={`/article/${mainEditorial.slug}`}
              className="group relative block overflow-hidden rounded-xl bg-card border border-border"
            >
              <div className="aspect-[16/10] relative">
                <img
                  src={mainEditorial.featuredImage}
                  alt={mainEditorial.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={mainEditorial.author.avatar}
                    alt={mainEditorial.author.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{mainEditorial.author.name}</p>
                    <p className="text-xs text-white/70 capitalize">{mainEditorial.author.role}</p>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-white md:text-2xl">
                  {mainEditorial.title}
                </h3>
                <p className="mt-2 text-sm text-white/80 line-clamp-2">
                  {mainEditorial.excerpt}
                </p>
              </div>
            </Link>
          )}

          {/* Side Editorials */}
          <div className="space-y-4">
            {sideEditorials.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group flex gap-4 rounded-lg bg-card p-4 border border-border hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    {article.author.name} • {article.author.role}
                  </p>
                  <h4 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
