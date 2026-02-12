import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { getPublishedArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { Button } from '@/components/ui/button';
import { getFeaturedSettings } from '@/lib/settingsService';

interface BreakingNewsTickerProps {
  maxHeadlines?: number;
  speed?: number;
}

export const BreakingNewsTicker = ({
  maxHeadlines = 5,
  speed: propSpeed
}: BreakingNewsTickerProps) => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [settings, setSettings] = useState<any>({
    breakingNewsIds: [],
    maxBreakingNews: 5,
    tickerSpeed: 20,
    breakingAutoSwipe: true,
    tickerMode: 'scroll', // Default to scroll
    autoSwipeInterval: 5000
  });

  const fetchData = useCallback(async () => {
    try {
      const articles = await getPublishedArticles();
      setArticlesList(articles || []);

      const featuredSettings = await getFeaturedSettings().catch(e => {
        console.error('BreakingNews: Settings fetch failed', e);
        return null;
      });

      if (featuredSettings) {
        setSettings((prev: any) => ({ ...prev, ...featuredSettings }));
      }
    } catch (error) {
      console.error('BreakingNews: Critical error in fetchData', error);
    }
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

  // Select breaking news
  const selectedBreakingNews = (settings.breakingNewsIds || [])
    .map(id => articlesList.find(a => a.id === id))
    .filter((a): a is Article => !!a)
    .slice(0, maxHeadlines);

  const breakingNews = selectedBreakingNews.length > 0
    ? selectedBreakingNews
    : articlesList.filter(a => a.isBreaking).length > 0
      ? articlesList.filter(a => a.isBreaking).slice(0, maxHeadlines)
      : articlesList.slice(0, maxHeadlines);

  const tickerMode = settings.tickerMode || 'scroll';
  const isAutoPlaying = settings.breakingAutoSwipe ?? true;

  // State for SWIPE mode
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSwipeInterval = settings.autoSwipeInterval ?? 5000;

  // State for SCROLL mode
  const tickerSpeed = propSpeed ?? settings.tickerSpeed ?? 20;
  const duration = Math.max(5, 100 - tickerSpeed);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe Logic
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  }, [breakingNews.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
  }, [breakingNews.length]);

  useEffect(() => {
    if (tickerMode === 'swipe' && breakingNews.length > 1 && isAutoPlaying) {
      const interval = setInterval(goToNext, autoSwipeInterval);
      return () => clearInterval(interval);
    }
  }, [tickerMode, breakingNews.length, isAutoPlaying, autoSwipeInterval, goToNext]);

  if (breakingNews.length === 0) return null;

  return (
    <div className="bg-accent text-accent-foreground border-b border-border/50 relative z-20 overflow-hidden">
      <div className="container mx-auto flex items-center h-10 sm:h-12 px-0 sm:px-4">
        {/* Label */}
        <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 h-full flex-shrink-0 z-10 relative shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)]">
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Breaking</span>
          {/* Angled separator visual */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-accent to-primary/0 translate-x-full" />
        </div>

        {/* ==================== SCROLL MODE (MARQUEE) ==================== */}
        {tickerMode === 'scroll' && (
          <div
            className="flex-1 overflow-hidden relative h-full flex items-center bg-accent/50 mask-gradient"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex items-center whitespace-nowrap animate-marquee hover:pause"
              style={{
                animationDuration: `${duration}s`,
                animationPlayState: (!isAutoPlaying || isPaused) ? 'paused' : 'running'
              } as React.CSSProperties}
            >
              {[...breakingNews, ...breakingNews, ...breakingNews].map((article, idx) => (
                <div key={`${article.id}-${idx}`} className="flex items-center">
                  <Link
                    to={`/article/${article.slug}`}
                    className="mr-12 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors shrink-0" />
                    <span className="font-bold">{article.title}</span>
                    {article.excerpt && (
                      <span className="font-normal text-muted-foreground hidden sm:inline">
                        - {article.excerpt.length > 60 ? article.excerpt.substring(0, 60) + '...' : article.excerpt}
                      </span>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== SWIPE MODE (CAROUSEL) ==================== */}
        {tickerMode === 'swipe' && (
          <div className="flex-1 overflow-hidden flex items-center justify-between px-4">
            {breakingNews.length > 1 && (
              <Button variant="ghost" size="icon" onClick={goToPrev} className="h-6 w-6 shrink-0 mr-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="flex-1 overflow-hidden relative h-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center sm:justify-start"
                >
                  <Link
                    to={`/article/${breakingNews[currentIndex].slug}`}
                    className="text-sm font-medium hover:underline flex items-center gap-2 truncate"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {breakingNews[currentIndex].title}
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {breakingNews.length > 1 && (
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={goToNext} className="h-6 w-6">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="flex gap-1 ml-1 hidden sm:flex">
                  {breakingNews.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-primary' : 'bg-primary/20'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); } 
        }
        .animate-marquee {
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          display: flex;
          width: fit-content;
        }
        .mask-gradient {
            mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent);
        }
      `}</style>
    </div>
  );
};
