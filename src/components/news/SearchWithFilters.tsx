import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { categories, authors } from '@/data/mockData';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface SearchWithFiltersProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const SearchWithFilters = ({ onClose, isModal = false }: SearchWithFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  useEffect(() => {
    setArticlesList(getArticles());
  }, []);

  const filteredArticles = useMemo(() => {
    return articlesList.filter(article => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(query);
        const matchesExcerpt = article.excerpt.toLowerCase().includes(query);
        const matchesTags = article.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesAuthor = article.author.name.toLowerCase().includes(query);

        if (!matchesTitle && !matchesExcerpt && !matchesTags && !matchesAuthor) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && article.category !== selectedCategory) {
        return false;
      }

      // Author filter
      if (selectedAuthor && article.author.id !== selectedAuthor) {
        return false;
      }

      // Date range filter
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        if (article.publishedAt < fromDate) {
          return false;
        }
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (article.publishedAt > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedAuthor, dateRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedAuthor(null);
    setDateRange({ from: '', to: '' });
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedAuthor || dateRange.from || dateRange.to;

  return (
    <div className={isModal ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80' : ''}>
      {isModal && (
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className={`container mx-auto px-4 ${isModal ? 'py-16' : 'py-8'}`}>
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, authors..."
              className="pl-12 pr-4 h-14 text-lg rounded-xl"
              autoFocus
            />
          </div>

          {/* Filter Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  Active
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Tag className="h-4 w-4" />
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant={selectedCategory === cat.id ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Author Filter */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <User className="h-4 w-4" />
                      Author
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {authors.map((author) => (
                        <Badge
                          key={author.id}
                          variant={selectedAuthor === author.id ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setSelectedAuthor(selectedAuthor === author.id ? null : author.id)}
                        >
                          {author.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      Date Range
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-auto"
                        placeholder="From"
                      />
                      <span className="self-center text-muted-foreground">to</span>
                      <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-auto"
                        placeholder="To"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredArticles.length} {filteredArticles.length === 1 ? 'result' : 'results'} found
          </p>

          {filteredArticles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground">No results found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
