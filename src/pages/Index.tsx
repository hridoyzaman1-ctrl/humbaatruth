import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { HeroSection } from '@/components/news/HeroSection';
import { LatestNews } from '@/components/news/LatestNews';
import { CategorySection } from '@/components/news/CategorySection';
import { TrendingSidebar } from '@/components/news/TrendingSidebar';
import { EditorialSection } from '@/components/news/EditorialSection';
import { VideoSection } from '@/components/news/VideoSection';
import { NewsletterSignup } from '@/components/news/NewsletterSignup';
import { InternshipBanner } from '@/components/news/InternshipBanner';
import { HomepageComments } from '@/components/news/HomepageComments';
import { getArticles } from '@/lib/articleService';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Article } from '@/types/news';

const Index = () => {
  const [currentArticles, setCurrentArticles] = useState<Article[]>([]);

  const fetchArticles = () => {
    setCurrentArticles(getArticles());
  };

  useEffect(() => {
    fetchArticles();

    // Listen for updates from other tabs/admin panel
    window.addEventListener('articlesUpdated', fetchArticles);
    return () => window.removeEventListener('articlesUpdated', fetchArticles);
  }, []);

  return (
    <Layout>
      <BreakingNewsTicker />
      <HeroSection />

      {/* Video Stories Section */}
      <VideoSection />

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 font-display text-xl font-bold text-foreground md:text-2xl border-b-2 border-primary pb-2">
                Latest Stories
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {currentArticles.slice(0, 6).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TrendingSidebar />
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </section>

      {/* Reader Comments Section */}
      <HomepageComments />

      {/* Internship Banner */}
      <InternshipBanner />

      <CategorySection category="untold-stories" title="Untold Stories" />

      {/* Sports Section */}
      <CategorySection category="sports" title="Sports" />

      {/* Entertainment Section */}
      <CategorySection category="entertainment" title="Entertainment" />

      <LatestNews />
      <CategorySection category="technology" title="Technology" />
      <CategorySection category="economy" title="Economy & Business" />

      {/* Editorial Section */}
      <EditorialSection />
    </Layout>
  );
};

export default Index;
