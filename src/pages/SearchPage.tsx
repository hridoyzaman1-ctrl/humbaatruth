import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { ArticleCard } from '@/components/news/ArticleCard';
import { ArticleCardSkeleton } from '@/components/ui/skeletons';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { usePagination } from '@/hooks/usePagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, Calendar, SortAsc, SortDesc } from 'lucide-react';
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay, subDays, subMonths, subYears } from 'date-fns';

const categories = [
  'all',
  'national',
  'international',
  'economy',
  'technology',
  'environment',
  'culture',
  'society',
  'sports',
  'entertainment',
  'untold-stories',
  'editorial',
];

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'year', label: 'Past Year' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  // Load articles
  useEffect(() => {
    setArticlesList(getArticles());
  }, []);

  // Simulate loading state on filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [category, dateRange, sortBy, articlesList]); // Re-run when articles load

  const filteredArticles = useMemo(() => {
    let results = [...articlesList];

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.category.toLowerCase().includes(searchTerm) ||
        article.author.name.toLowerCase().includes(searchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (category !== 'all') {
      results = results.filter(article => article.category === category);
    }

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const start = startOfDay(now);
      results = results.filter(article => isAfter(article.publishedAt, start));
    } else if (dateRange === 'week') {
      const start = subDays(now, 7);
      results = results.filter(article => isAfter(article.publishedAt, start));
    } else if (dateRange === 'month') {
      const start = subMonths(now, 1);
      results = results.filter(article => isAfter(article.publishedAt, start));
    } else if (dateRange === 'year') {
      const start = subYears(now, 1);
      results = results.filter(article => isAfter(article.publishedAt, start));
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
        break;
      case 'oldest':
        results.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
        break;
      case 'popular':
        results.sort((a, b) => b.views - a.views);
        break;
      case 'az':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'za':
        results.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return results;
  }, [query, category, dateRange, sortBy]);

  const ITEMS_PER_PAGE = 9;

  const {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    isLoading: isPaginationLoading
  } = usePagination({
    items: filteredArticles,
    itemsPerPage: ITEMS_PER_PAGE
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setDateRange('all');
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters = query || category !== 'all' || dateRange !== 'all' || sortBy !== 'newest';
  const showLoading = isLoading || isPaginationLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Search Articles
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, topics, authors..."
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" size="lg" className="h-12">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card rounded-xl border border-border p-4 space-y-6 sticky top-24">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    Clear all
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {dateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
                  <div className="flex flex-wrap gap-1">
                    {query && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        "{query}"
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setQuery('')} />
                      </Badge>
                    )}
                    {category !== 'all' && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        {category.replace('-', ' ')}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory('all')} />
                      </Badge>
                    )}
                    {dateRange !== 'all' && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        {dateRanges.find(d => d.value === dateRange)?.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setDateRange('all')} />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'result' : 'results'} found
                {query && <span> for "<span className="text-foreground font-medium">{query}</span>"</span>}
                {totalPages > 1 && <span className="ml-1">• Page {currentPage} of {totalPages}</span>}
              </p>

              {/* Mobile Sort */}
              <div className="lg:hidden">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Grid */}
            {showLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            ) : currentItems.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {currentItems.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  isLoading={isPaginationLoading}
                  className="mt-8"
                />
              </>
            ) : (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;