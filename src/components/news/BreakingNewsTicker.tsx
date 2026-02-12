import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Pause, Play, ExternalLink } from 'lucide-react';
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
    breakingAutoSwipe: true // We'll use this as "Auto Scroll" toggle
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

  const tickerSpeed = propSpeed ?? settings.tickerSpeed ?? 20;
  const isPlaying = settings.breakingAutoSwipe ?? true;
  const [isPaused, setIsPaused] = useState(false);

  if (breakingNews.length === 0) return null;

  // Calculate duration based on speed. 
  // Speed 1 = Slow (e.g., 100s), Speed 100 = Fast (e.g., 5s)
  // Base duration for a standard width could be roughly mapped.
  // We'll use a simple formula: Duration = Base / Speed
  // Let's say at speed 20, we want it to take 30s. 20 * 30 = 600 constant.
  // So Duration = 600 / Speed.
  // Actually, better to have a linear feeling. 
  // range 5-100. 
  // Speed 5 -> 60s
  // Speed 100 -> 5s
  // Formula: duration = 65 - (speed * 0.6) roughly? 
  // Let's try: 4000 / speed (seconds) might be too simple if content length varies.
  // CSS animate-marquee usually needs distinct duration per width, but we can just set a fixed "speed" via --duration variable if we assume average width or just let it fly.
  // A better approach for "controlled speed" is pixels per second, but that needs JS measurement.
  // Let's stick to a robust CSS animation with a variable duration.

  const duration = Math.max(5, 100 - tickerSpeed); // In seconds. Speed 100 -> 0s (too fast), so lets say 100 -> 5s, 0 -> 100s.

  return (
    <div className="bg-accent text-accent-foreground border-b border-border/50 relative z-20 overflow-hidden">
      <div className="container mx-auto flex items-center h-10 sm:h-12">
        {/* Label */}
        <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 h-full flex-shrink-0 z-10 relative shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)]">
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Breaking</span>
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-transparent to-primary/0 translate-x-full" />
        </div>

        {/* Marquee Container */}
        <div
          className="flex-1 overflow-hidden relative h-full flex items-center bg-accent/50"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {breakingNews.length > 0 && (
            <div
              className="flex items-center whitespace-nowrap animate-marquee hover:pause"
              style={{
                animationDuration: `${duration}s`,
                animationPlayState: (!isPlaying || isPaused) ? 'paused' : 'running'
              } as React.CSSProperties}
            >
              {[...breakingNews, ...breakingNews, ...breakingNews].map((article, idx) => (
                <div key={`${article.id}-${idx}`} className="flex items-center">
                  <Link
                    to={`/article/${article.slug}`}
                    className="mx-4 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                    {article.title}
                  </Link>
                  <span className="text-accent-foreground/20 mx-2">|</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls (Optional, usually Marquee doesn't have next/prev, just pause) */}
        <div className="flex items-center px-2 bg-accent z-10 h-full border-l border-border/20 shadow-[-4px_0_10px_-2px_rgba(0,0,0,0.1)]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettings(prev => ({ ...prev, breakingAutoSwipe: !prev.breakingAutoSwipe }))}
            className="h-8 w-8 text-accent-foreground/70 hover:text-accent-foreground hover:bg-accent-foreground/10"
            title={isPlaying ? 'Pause Scrolling' : 'Resume Scrolling'}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
        </div>
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
          width: fit-content; /* Ensure it takes full width of content */
        }
      `}</style>
    </div>
  );
};
