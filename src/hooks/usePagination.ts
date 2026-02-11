import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePaginationOptions<T> {
  items: T[];
  itemsPerPage: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentItems: T[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  isLoading: boolean;
}

export function usePagination<T>({
  items,
  itemsPerPage,
  initialPage = 1
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    setIsLoading(true);
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    // Simulate loading for smooth UX
    setTimeout(() => setIsLoading(false), 300);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, hasNextPage, goToPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, hasPrevPage, goToPage]);

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    isLoading
  };
}

interface UseInfiniteScrollOptions<T> {
  items: T[];
  itemsPerPage: number;
}

interface UseInfiniteScrollReturn<T> {
  visibleItems: T[];
  hasMore: boolean;
  loadMore: () => void;
  isLoading: boolean;
  reset: () => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll<T>({
  items,
  itemsPerPage
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate network delay for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + itemsPerPage, items.length));
      setIsLoading(false);
    }, 400);
  }, [isLoading, hasMore, itemsPerPage, items.length]);

  const reset = useCallback(() => {
    setVisibleCount(itemsPerPage);
  }, [itemsPerPage]);

  // Intersection Observer for auto-loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  // Reset when items change
  useEffect(() => {
    reset();
  }, [items.length, reset]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    isLoading,
    reset,
    loadMoreRef
  };
}
