import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Eye, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Article } from '@/types/news';
import { formatDistanceToNow } from 'date-fns';
import { getYoutubeThumbnail, FALLBACK_IMAGE } from '@/lib/videoUtils';
import { getCategoryColor } from '@/lib/categoryUtils';
import { VideoPlayerModal } from './VideoPlayerModal';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured' | 'video';
}

export const ArticleCard = ({ article, variant = 'default' }: ArticleCardProps) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleVideoIconClick = (e: React.MouseEvent) => {
    if (article.videoUrl) {
      e.preventDefault();
      e.stopPropagation();
      setIsVideoModalOpen(true);
    }
  };

  const getDisplayImage = () => {
    if (article.featuredImage) return article.featuredImage;
    if (article.videoUrl) {
      const thumb = getYoutubeThumbnail(article.videoUrl);
      if (thumb) return thumb;
    }
    return FALLBACK_IMAGE;
  };

  const displayImage = getDisplayImage();

  const renderCardContent = () => {
    if (variant === 'compact') {
      return (
        <Link
          to={`/article/${article.slug}`}
          className="group block overflow-hidden rounded-lg bg-card transition-shadow hover:shadow-md border border-border"
        >
          <div className="aspect-[16/9] overflow-hidden relative">
            <img
              src={displayImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            />
            {article.hasVideo && (
              <div
                className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-black/80 transition-colors z-20"
                onClick={handleVideoIconClick}
              >
                <PlayCircle className="h-2.5 w-2.5 text-white" />
                <span className="text-[9px] font-medium text-white">Video</span>
              </div>
            )}
            <Badge className={`absolute bottom-1.5 left-1.5 ${getCategoryColor(article.category)} text-white border-0 text-[9px] px-1.5 py-0`}>
              {(article.category || 'news').replace('-', ' ')}
            </Badge>
          </div>
          <div className="p-2.5">
            <h4 className="line-clamp-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              {article.title}
            </h4>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
            </span>
          </div>
        </Link>
      );
    }

    if (variant === 'featured') {
      return (
        <Link
          to={`/article/${article.slug}`}
          className="group relative block overflow-hidden rounded-xl"
        >
          <div className="aspect-[4/3] relative">
            <img
              src={displayImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            />
            {article.hasVideo && (
              <div
                className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full cursor-pointer hover:bg-black/80 transition-colors z-20"
                onClick={handleVideoIconClick}
              >
                <PlayCircle className="h-3 w-3 text-white" />
                <span className="text-[10px] font-medium text-white">Video</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Badge className={`${getCategoryColor(article.category)} mb-2 text-white border-0`}>
              {(article.category || 'news').replace('-', ' ')}
            </Badge>
            <h3 className="font-display text-lg font-bold text-white">
              {article.title}
            </h3>
          </div>
        </Link>
      );
    }

    if (variant === 'video') {
      return (
        <Link
          to={`/article/${article.slug}`}
          className="group block overflow-hidden rounded-xl bg-card border border-border transition-shadow hover:shadow-lg h-full"
        >
          <div className="aspect-video overflow-hidden relative flex-shrink-0">
            <img
              src={displayImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors z-20"
              onClick={handleVideoIconClick}
            >
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
        </Link>
      );
    }

    return (
      <Link
        to={`/article/${article.slug}`}
        className="group block overflow-hidden rounded-lg bg-card transition-shadow hover:shadow-lg border border-border"
      >
        <div className="aspect-video overflow-hidden relative">
          <img
            src={displayImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          />
          {article.hasVideo && (
            <div
              className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full cursor-pointer hover:bg-black/80 transition-colors z-20"
              onClick={handleVideoIconClick}
            >
              <PlayCircle className="h-3 w-3 text-white" />
              <span className="text-[10px] font-medium text-white">Video</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <Badge className={`${getCategoryColor(article.category)} mb-2 text-white border-0 text-[10px]`}>
            {(article.category || 'news').replace('-', ' ')}
          </Badge>
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {(article.views || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      {renderCardContent()}

      {article.videoUrl && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={article.videoUrl}
          title={article.title}
        />
      )}
    </>
  );
};
