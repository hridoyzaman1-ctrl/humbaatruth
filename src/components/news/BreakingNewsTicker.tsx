import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { Button } from '@/components/ui/button';
import { getFeaturedSettings } from '@/lib/settingsService';

interface BreakingNewsTickerProps {
  maxHeadlines?: number;
  autoSwipeInterval?: number;
}

export const BreakingNewsTicker = ({
  maxHeadlines = 5,
  autoSwipeInterval: propInterval
}: BreakingNewsTickerProps) => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [settings, setSettings] = useState(getFeaturedSettings());

  const fetchData = useCallback(() => {
    setArticlesList(getArticles());
    setSettings(getFeaturedSettings());
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener('articlesUpdated', fetchData);
    window.addEventListener('featuredSettingsUpdated', fetchData);
    return () => {
      window.removeEventListener('articlesUpdated', fetchData);
      window.removeEventListener('featuredSettingsUpdated', fetchData);
    };
  }, [fetchData]);

  // Use settings for breaking news IDs
  const breakingNews = settings.breakingNewsIds
    .map(id => articlesList.find(a => a.id === id))
    .filter((a): a is Article => !!a)
    .slice(0, maxHeadlines);

  const autoSwipeInterval = propInterval ?? settings.autoSwipeInterval ?? 5000;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(settings.breakingAutoSwipe ?? true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  }, [breakingNews.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
  }, [breakingNews.length]);

  useEffect(() => {
    if (breakingNews.length <= 1 || !isAutoPlaying) return;

    const interval = setInterval(goToNext, autoSwipeInterval);
    return () => clearInterval(interval);
  }, [breakingNews.length, isAutoPlaying, autoSwipeInterval, goToNext]);

  if (breakingNews.length === 0) return null;

  return (
    <div className="bg-accent text-accent-foreground">
      <div className="container mx-auto flex items-center px-4 py-2 gap-2">
        <div className="flex items-center gap-2 bg-accent-foreground/10 px-3 py-1 rounded-full flex-shrink-0">
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Breaking</span>
        </div>

        {/* Navigation Arrows */}
        {breakingNews.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            className="h-7 w-7 text-accent-foreground hover:bg-accent-foreground/20 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={`/article/${breakingNews[currentIndex].slug}`}
                className="flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <span className="line-clamp-1">{breakingNews[currentIndex].title}</span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {breakingNews.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="h-7 w-7 text-accent-foreground hover:bg-accent-foreground/20 flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Auto-play toggle */}
        {breakingNews.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="h-7 w-7 text-accent-foreground hover:bg-accent-foreground/20 flex-shrink-0"
            title={isAutoPlaying ? 'Pause auto-swipe' : 'Resume auto-swipe'}
          >
            {isAutoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
        )}

        {/* Dots indicator */}
        {breakingNews.length > 1 && (
          <div className="flex gap-1 flex-shrink-0">
            {breakingNews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-accent-foreground' : 'bg-accent-foreground/40'
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
