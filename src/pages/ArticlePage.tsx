import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getArticleBySlug, getPublishedArticles, incrementArticleViews } from '@/lib/articleService';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Facebook, Twitter, Linkedin, Mail, Link2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArticleCard } from '@/components/news/ArticleCard';
import { CommentSection } from '@/components/news/CommentSection';
import { getYoutubeId } from '@/lib/videoUtils';
import { FloatingVideoPlayer } from '@/components/news/FloatingVideoPlayer';
import { SEO } from '@/components/seo/SEO';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<import('@/types/news').Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load related articles
  const [relatedArticles, setRelatedArticles] = useState<import('@/types/news').Article[]>([]);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        if (!slug) { setIsLoading(false); return; }
        const fetched = await getArticleBySlug(slug);
        setArticle(fetched);
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadArticle();
  }, [slug]);

  useEffect(() => {
    if (article?.id) {
      incrementArticleViews(article.id);
    }
  }, [article?.id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const allArticles = await getPublishedArticles();
        const related = allArticles
          .filter(a => a.category === article?.category && a.id !== article?.id)
          .slice(0, 3);
        setRelatedArticles(related);
      } catch (err) {
        console.error('Failed to load related articles:', err);
      }
    };

    if (article) {
      fetchRelated();
    }
  }, [article?.id, article?.category]);

  const heroVideoRef = useRef<HTMLDivElement>(null);
  const [showFloatingPlayer, setShowFloatingPlayer] = useState(false);

  // Scroll observer to trigger floating player
  useEffect(() => {
    if (!article?.videoUrl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show floating player when hero video is OUT of view (entry.isIntersecting is false)
        // and we have scrolled PAST it (entry.boundingClientRect.top < 0)
        setShowFloatingPlayer(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.2 } // Trigger when 80% is out of view
    );

    if (heroVideoRef.current) {
      observer.observe(heroVideoRef.current);
    }

    return () => observer.disconnect();
  }, [article?.videoUrl]);

  // Relaxed logic for "is video article"
  const isVideoArticle = useMemo(() => {
    if (!article) return false;
    return Boolean((article.hasVideo || article.videoUrl) && article.videoUrl);
  }, [article]);

  const youtubeId = useMemo(() => {
    if (!isVideoArticle || !article?.videoUrl) return null;
    return getYoutubeId(article.videoUrl);
  }, [isVideoArticle, article?.videoUrl]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Article Not Found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </Layout>
    );
  }

  const articleContainerClass = `container mx-auto px-4 ${isVideoArticle ? 'mt-6 md:mt-8' : '-mt-20'} relative z-10`;

  return (
    <Layout>
      <SEO
        title={article.title}
        description={article.excerpt}
        image={article.featuredImage}
        type="article"
        author={article.customAuthor || article.author?.name}
        keywords={article.tags}
      />

      {/* Hero Image or Video */}
      <div
        ref={heroVideoRef}
        className="relative h-64 md:h-96 lg:h-[500px] bg-black overflow-hidden"
      >
        {isVideoArticle && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0`}
            title={article.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </>
        )}
      </div>

      {isVideoArticle && article.videoUrl && (
        <FloatingVideoPlayer
          videoUrl={article.videoUrl}
          title={article.title}
          isVisible={showFloatingPlayer}
        />
      )}

      <article className={articleContainerClass}>
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary text-primary-foreground">
                {(article.category || 'news').replace('-', ' ')}
              </Badge>
              {article.isBreaking && (
                <Badge className="bg-accent text-accent-foreground">Breaking</Badge>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              {article.title}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              {article.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <img
                  src={article.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author?.name || 'User'}`}
                  alt={article.customAuthor || article.author?.name || 'Author'}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">{article.customAuthor || article.author?.name || 'Staff'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{article.customAuthor ? 'Contributor' : (article.author?.role || 'author')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.publishedAt instanceof Date && !isNaN(article.publishedAt.getTime())
                    ? format(article.publishedAt, 'd MMMM, yyyy')
                    : 'Recent'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {(article.views || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="mt-8 prose prose-lg max-w-none dark:prose-invert">
            {(article.content || '').split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-justify leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {(article.tags || []).map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Social Share Buttons */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Share this article</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(article.title)}`, '_blank', 'width=600,height=400')}
              >
                <Facebook className="h-4 w-4" />
                <span className="hidden sm:inline">Facebook</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-black hover:text-white hover:border-black transition-colors"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank', 'width=600,height=400')}
              >
                <XIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Post</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
                onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}&summary=${encodeURIComponent(article.excerpt)}`, '_blank', 'width=600,height=400')}
              >
                <Linkedin className="h-4 w-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`, '_blank')}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-muted transition-colors"
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent('Check out this article: ' + window.location.href)}`, '_self')}
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
              >
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection articleId={article.id} />
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="mb-6 font-display text-xl font-bold text-foreground md:text-2xl border-b-2 border-primary pb-2">
            Related Articles
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ArticlePage;
