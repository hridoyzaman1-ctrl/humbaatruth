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
import { getPublishedArticles } from '@/lib/articleService';
import { getSectionsSettings, SectionConfig } from '@/lib/settingsService';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Article } from '@/types/news';

// Default section configs (fallback if DB unavailable)
const defaultSections: Omit<SectionConfig, 'icon'>[] = [
  { id: 'breaking-news', name: 'Breaking News Ticker', enabled: true, order: 1, maxArticles: 5, selectedArticleIds: [], showOnHomepage: true },
  { id: 'hero', name: 'Hero Section', enabled: true, order: 2, maxArticles: 5, selectedArticleIds: [], showOnHomepage: true },
  { id: 'video-stories', name: 'Video Stories', enabled: true, order: 3, maxArticles: 4, selectedArticleIds: [], showOnHomepage: true },
  { id: 'latest-stories', name: 'Latest Stories', enabled: true, order: 4, maxArticles: 6, selectedArticleIds: [], showOnHomepage: true },
  { id: 'trending', name: 'Trending Now', enabled: true, order: 5, maxArticles: 5, selectedArticleIds: [], showOnHomepage: true },
  { id: 'comments', name: 'Reader Comments', enabled: true, order: 6, maxArticles: 3, selectedArticleIds: [], showOnHomepage: true },
  { id: 'internship-banner', name: 'Internship Banner', enabled: true, order: 7, maxArticles: 0, selectedArticleIds: [], showOnHomepage: true },
  { id: 'untold-stories', name: 'Untold Stories', enabled: true, order: 8, maxArticles: 4, selectedArticleIds: [], showOnHomepage: true, category: 'untold-stories' },
  { id: 'sports', name: 'Sports', enabled: true, order: 9, maxArticles: 4, selectedArticleIds: [], showOnHomepage: true, category: 'sports' },
  { id: 'entertainment', name: 'Entertainment', enabled: true, order: 10, maxArticles: 4, selectedArticleIds: [], showOnHomepage: true, category: 'entertainment' },
  { id: 'editorial', name: 'Editorial & Opinion', enabled: true, order: 11, maxArticles: 4, selectedArticleIds: [], showOnHomepage: true, category: 'editorial' },
];

const Index = () => {
  const [currentArticles, setCurrentArticles] = useState<Article[]>([]);
  const [sections, setSections] = useState<Omit<SectionConfig, 'icon'>[]>(defaultSections);

  const fetchArticles = async () => {
    const data = await getPublishedArticles();
    setCurrentArticles(data);
  };

  const loadSections = async () => {
    try {
      const saved = await getSectionsSettings(defaultSections as SectionConfig[]);
      setSections(saved.map(({ icon, ...rest }) => rest));
    } catch (e) {
      console.error('Failed to load section settings', e);
    }
  };

  useEffect(() => {
    fetchArticles();
    loadSections();

    // Listen for updates from other tabs/admin panel
    window.addEventListener('articlesUpdated', fetchArticles);
    window.addEventListener('sectionsSettingsUpdated', loadSections);
    return () => {
      window.removeEventListener('articlesUpdated', fetchArticles);
      window.removeEventListener('sectionsSettingsUpdated', loadSections);
    };
  }, []);

  // Helper to get a section config by id
  const getSection = (id: string) => sections.find(s => s.id === id);
  const isSectionVisible = (id: string) => {
    const sec = getSection(id);
    return sec ? sec.enabled && sec.showOnHomepage : true;
  };
  const getSectionMax = (id: string, fallback: number) => {
    const sec = getSection(id);
    return sec?.maxArticles ?? fallback;
  };

  return (
    <Layout>
      {isSectionVisible('breaking-news') && <BreakingNewsTicker />}
      {isSectionVisible('hero') && <HeroSection />}

      {/* Video Stories Section */}
      {isSectionVisible('video-stories') && <VideoSection />}

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 font-display text-xl font-bold text-foreground md:text-2xl border-b-2 border-primary pb-2">
                Latest Stories
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {currentArticles.slice(0, getSectionMax('latest-stories', 6)).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {isSectionVisible('trending') && <TrendingSidebar />}
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </section>

      {/* Reader Comments Section */}
      {isSectionVisible('comments') && <HomepageComments />}

      {/* Internship Banner */}
      {isSectionVisible('internship-banner') && <InternshipBanner />}

      {isSectionVisible('untold-stories') && (
        <CategorySection category="untold-stories" title="Untold Stories" maxArticles={getSectionMax('untold-stories', 4)} />
      )}

      {/* Sports Section */}
      {isSectionVisible('sports') && (
        <CategorySection category="sports" title="Sports" maxArticles={getSectionMax('sports', 4)} />
      )}

      {/* Entertainment Section */}
      {isSectionVisible('entertainment') && (
        <CategorySection category="entertainment" title="Entertainment" maxArticles={getSectionMax('entertainment', 4)} />
      )}

      <LatestNews />
      <CategorySection category="technology" title="Technology" maxArticles={getSectionMax('technology', 4)} />
      <CategorySection category="economy" title="Economy & Business" maxArticles={getSectionMax('economy', 4)} />

      {/* Editorial Section */}
      {isSectionVisible('editorial') && <EditorialSection />}
    </Layout>
  );
};

export default Index;
