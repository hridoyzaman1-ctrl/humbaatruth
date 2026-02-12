import { useState, useEffect, useCallback } from 'react';
import { getPublishedArticles } from '@/lib/articleService';
import { PlayCircle, Video, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoPlayerModal } from './VideoPlayerModal';
import { formatDistanceToNow } from 'date-fns';
import { Article } from '@/types/news';
import { getSectionsSettings } from '@/lib/settingsService';
import { getCategoryColor } from '@/lib/categoryUtils';

interface VideoCardProps {
  article: Article;
  onPlay: () => void;
}

import { getYoutubeThumbnail, FALLBACK_IMAGE } from '@/lib/videoUtils';

// Default sections definition for fallback
const defaultSections = [
  { id: 'video-stories', name: 'Video Stories', enabled: true, order: 3, maxArticles: 4, selectedArticleIds: [], showOnHomepage: true }
];

const VideoCard = ({ article, onPlay }: VideoCardProps) => {
  const displayImage = article.featuredImage ||
    (article.videoUrl ? getYoutubeThumbnail(article.videoUrl) : null) ||
    FALLBACK_IMAGE;

  return (
    <div
      onClick={onPlay}
      className="group block overflow-hidden rounded-xl bg-card border border-border transition-shadow hover:shadow-lg h-full cursor-pointer"
    >
      <div className="aspect-video overflow-hidden relative flex-shrink-0">
        <img
          src={displayImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <PlayCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
        </div>
        <Badge className={`absolute top-2 left-2 ${getCategoryColor(article.category)} text-white border-0 text-[10px]`}>
          {(article.category || 'news').replace('-', ' ')}
        </Badge>
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-display text-sm md:text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] md:min-h-[3rem]">
          {article.title}
        </h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3 flex-shrink-0" />
            {(article.views || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export const VideoSection = () => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [sections, setSections] = useState(defaultSections);

  const fetchData = useCallback(async () => {
    const data = await getPublishedArticles();
    setArticlesList(data);
    const settings = await getSectionsSettings(defaultSections);
    setSections(settings);
  }, []);

  // Load data and simulate loading
  useEffect(() => {
    fetchData();
    window.addEventListener('articlesUpdated', fetchData);
    window.addEventListener('sectionsSettingsUpdated', fetchData);

    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('articlesUpdated', fetchData);
      window.removeEventListener('sectionsSettingsUpdated', fetchData);
    };
  }, [fetchData]);

  // Get video section settings
  const videoSection = sections.find(s => s.id === 'video-stories');

  // If we have selected articles in settings, use those. Otherwise fallback to filter by hasVideo.
  let videoArticles: Article[] = [];
  if (videoSection && (videoSection.selectedArticleIds || []).length > 0) {
    videoArticles = (videoSection.selectedArticleIds || [])
      .map(id => articlesList.find(a => a.id === id))
      .filter((a): a is Article => !!a && !!a.videoUrl);
  } else {
    // Fallback: filter by hasVideo
    videoArticles = articlesList.filter(a => (a.hasVideo || !!a.videoUrl) && a.videoUrl).slice(0, 4);
  }

  if (videoArticles.length === 0 && !isLoading) return null;

  if (isLoading) {
    return (
      <section className="py-8 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-7 w-36" />
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-card border border-border">
                <div className="relative">
                  <Skeleton className="aspect-video w-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="h-14 w-14 rounded-full" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (videoArticles.length === 0) return null;

  return (
    <>
      <section className="py-8 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Video className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
                Video Stories
              </h2>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {videoArticles.map((article) => (
              <div key={article.id} className="relative isolate">
                <VideoCard
                  article={article}
                  onPlay={() => setSelectedVideo(article)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedVideo && selectedVideo.videoUrl && (
        <VideoPlayerModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
        />
      )}
    </>
  );
};
