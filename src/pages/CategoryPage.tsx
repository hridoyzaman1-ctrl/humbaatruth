import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { categories } from '@/data/mockData';
import { getArticles } from '@/lib/articleService';
import { Article, Category } from '@/types/news';
import { ArticleCard } from '@/components/news/ArticleCard';
import { ArticleCardSkeleton } from '@/components/ui/skeletons';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { usePagination } from '@/hooks/usePagination';

const ITEMS_PER_PAGE = 9;

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  const category = categories.find(c => c.id === categoryId);
  const categoryArticles = articlesList.filter(a => a.category === categoryId as Category);

  useEffect(() => {
    setArticlesList(getArticles());
  }, []);

  const {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    isLoading: isPaginationLoading
  } = usePagination({
    items: categoryArticles,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // Simulate initial loading state
  useEffect(() => {
    setIsInitialLoading(true);
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, [categoryId]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Category Not Found</h1>
        </div>
      </Layout>
    );
  }

  const isLoading = isInitialLoading || isPaginationLoading;

  return (
    <Layout>
      <div className="bg-primary py-6 md:py-8 mb-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/80">{category.description}</p>
          {categoryArticles.length > 0 && (
            <p className="mt-2 text-xs text-primary-foreground/60">
              {categoryArticles.length} articles • Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : currentItems.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              isLoading={isPaginationLoading}
              className="mt-8"
            />
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No articles in this category yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
