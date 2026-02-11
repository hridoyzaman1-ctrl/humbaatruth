import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, ChevronLeft, ChevronRight, Pause, Play, PlayCircle } from 'lucide-react';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { getYoutubeThumbnail, FALLBACK_IMAGE } from '@/lib/videoUtils';

import { getFeaturedSettings } from '@/lib/settingsService';

export const HeroSection = () => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [settings, setSettings] = useState(getFeaturedSettings());
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = useCallback(() => {
    setArticlesList(getArticles());
    setSettings(getFeaturedSettings());
  }, []);

  // Load data and listen for updates
  useEffect(() => {
    // Initial fetch
    fetchArticles();
    // Simulate slight loading for skeleton demo (optional, but keeps UI smooth)
    const timer = setTimeout(() => setIsLoading(false), 500);

    window.addEventListener('articlesUpdated', fetchArticles);
    window.addEventListener('featuredSettingsUpdated', fetchArticles);

    return () => {
      window.removeEventListener('articlesUpdated', fetchArticles);
      window.removeEventListener('featuredSettingsUpdated', fetchArticles);
      clearTimeout(timer);
    };
  }, [fetchArticles]);

  // Order articles based on settings.heroFeaturedIds
  const featuredArticles = settings.heroFeaturedIds
    .map(id => articlesList.find(a => a.id === id))
    .filter((a): a is Article => !!a); // Filter out undefined if an article was deleted

  // Fallback if no hero articles selected
  if (featuredArticles.length === 0 && articlesList.length > 0) {
    // Logic for fallback can stay or we just show nothing.
    // The original code fell back to "articlesList.slice(0, 5)".
  }

  // Use settings for auto swipe
  const { heroAutoSwipe = true, autoSwipeInterval = 6000 } = settings;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(heroAutoSwipe);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
  }, [featuredArticles.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  }, [featuredArticles.length]);

  useEffect(() => {
    if (featuredArticles.length <= 1 || !isAutoPlaying) return;

    const interval = setInterval(goToNext, autoSwipeInterval);
    return () => clearInterval(interval);
  }, [featuredArticles.length, isAutoPlaying, goToNext, autoSwipeInterval]);

  // Define sideArticles: Use settings.heroSideArticleIds or fallback
  const sideArticles = (settings.heroSideArticleIds || [])
    .map(id => articlesList.find(a => a.id === id))
    .filter((a): a is Article => !!a)
    .slice(0, 4);

  // Fallback if no side articles configured
  const displaySideArticles = sideArticles.length > 0
    ? sideArticles
    : articlesList.filter(a => !settings.heroFeaturedIds.includes(a.id)).slice(0, 4);

  const getDisplayImage = (article: Article) => {
    if (article.featuredImage) return article.featuredImage;
    if (article.videoUrl) {
      const thumb = getYoutubeThumbnail(article.videoUrl);
      if (thumb) return thumb;
    }
    return FALLBACK_IMAGE;
  };

  if (featuredArticles.length === 0 && !isLoading) return null;

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            {/* Main Featured Skeleton */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-xl bg-card border border-border">
                <Skeleton className="aspect-[16/10] lg:aspect-[16/9] w-full" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 space-y-3">
                  <Skeleton className="h-5 w-24 bg-white/20" />
                  <Skeleton className="h-8 w-full bg-white/20" />
                  <Skeleton className="h-8 w-3/4 bg-white/20" />
                  <Skeleton className="h-4 w-full bg-white/20 hidden md:block" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
                    <Skeleton className="h-4 w-32 bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Side Articles Skeleton */}
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-card border border-border">
                  <Skeleton className="h-20 w-28 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentArticle = featuredArticles[currentIndex];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      national: 'bg-blue-500',
      international: 'bg-purple-500',
      economy: 'bg-amber-500',
      environment: 'bg-emerald-500',
      technology: 'bg-cyan-500',
      culture: 'bg-pink-500',
      editorial: 'bg-slate-500',
      society: 'bg-orange-500',
      'untold-stories': 'bg-red-600',
      sports: 'bg-green-500',
      entertainment: 'bg-fuchsia-500',
    };
    return colors[category] || 'bg-primary';
  };

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {/* Main Featured Article with Auto-Swipe */}
          <div className="lg:col-span-2 relative">
            <div className="relative overflow-hidden rounded-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to={`/article/${currentArticle.slug}`} className="group relative block">
                    <div className="aspect-[16/10] lg:aspect-[16/9]">
                      <img
                        src={getDisplayImage(currentArticle)}
                        alt={currentArticle.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="eager"
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Video indicator */}
                    {currentArticle.hasVideo && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
                        <PlayCircle className="h-4 w-4 text-white" />
                        <span className="text-xs font-medium text-white">Video</span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
                      <Badge className={`${getCategoryColor(currentArticle.category)} mb-2 md:mb-3 text-white border-0 uppercase tracking-wide text-[10px] md:text-xs`}>
                        {currentArticle.category.replace('-', ' ')}
                      </Badge>
                      <h2 className="font-display text-lg font-bold text-white md:text-2xl lg:text-3xl xl:text-4xl leading-tight line-clamp-2 md:line-clamp-none">
                        {currentArticle.title}
                      </h2>
                      {/* Hide excerpt on mobile */}
                      <p className="mt-2 line-clamp-2 text-sm text-white/80 md:text-base max-w-3xl hidden md:block">
                        {currentArticle.excerpt}
                      </p>
                      {/* Simplified mobile meta, full on desktop */}
                      <div className="mt-2 md:mt-4 flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-white/70">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(currentArticle.publishedAt, { addSuffix: true })}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {currentArticle.views.toLocaleString()} views
                        </span>
                        <span className="hidden md:inline">By {currentArticle.author.name}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              {featuredArticles.length > 1 && (
                <>
                  {/* Arrows */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Bottom Controls */}
                  <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2">
                    {/* Dots */}
                    <div className="flex gap-1.5">
                      {featuredArticles.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/70'
                            }`}
                        />
                      ))}
                    </div>

                    {/* Play/Pause */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
                    >
                      {isAutoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </div>

                  {/* Slide Counter */}
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs text-white font-medium">
                      {currentIndex + 1} / {featuredArticles.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Side Articles */}
          <div className="flex flex-col gap-3">
            {displaySideArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/article/${article.slug}`}
                  className="group flex gap-3 rounded-lg bg-card p-3 transition-all hover:bg-muted hover:shadow-md border border-transparent hover:border-border"
                >
                  <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-md md:h-20 md:w-28 relative">
                    <img
                      src={getDisplayImage(article)}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                    {article.hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <PlayCircle className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <Badge variant="outline" className={`mb-1 w-fit text-[10px] ${getCategoryColor(article.category)} text-white border-0`}>
                      {article.category.replace('-', ' ')}
                    </Badge>
                    <h3 className="line-clamp-2 font-display text-sm font-semibold text-foreground md:text-sm group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
