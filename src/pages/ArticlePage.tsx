import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getArticleBySlug, getArticles, incrementArticleViews } from '@/lib/articleService';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Share2, Facebook, Twitter, Linkedin, Mail, Link2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { ArticleCard } from '@/components/news/ArticleCard';
import { CommentSection } from '@/components/news/CommentSection';
import { getYoutubeId } from '@/lib/videoUtils';
import { FloatingVideoPlayer } from '@/components/news/FloatingVideoPlayer';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  useEffect(() => {
    if (article?.id) {
      incrementArticleViews(article.id);
    }
  }, [article?.id]);

  // getArticles() returns the full list from storage/mock
  const allArticles = getArticles();
  const relatedArticles = allArticles
    .filter(a => a.category === article?.category && a.id !== article?.id)
    .slice(0, 3);

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
  const isVideoArticle = Boolean(article && (article.hasVideo || article.videoUrl) && article.videoUrl);
  const articleContainerClass = `container mx-auto px-4 ${isVideoArticle ? 'mt-6 md:mt-8' : '-mt-20'} relative z-10`;

  const youtubeId = isVideoArticle ? getYoutubeId(article.videoUrl!) : null;

  return (
    <Layout>
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
                {article.category.replace('-', ' ')}
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
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">{article.author.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{article.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(article.publishedAt, 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="mt-8 prose prose-lg max-w-none dark:prose-invert">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-justify leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
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
                className="gap-2 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank', 'width=600,height=400')}
              >
                <Twitter className="h-4 w-4" />
                <span className="hidden sm:inline">Twitter</span>
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
