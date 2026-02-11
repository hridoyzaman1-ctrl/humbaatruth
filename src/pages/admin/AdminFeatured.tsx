import { useState, useEffect } from 'react';
import { Save, Newspaper, Layout, Settings2, X, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { FeaturedSettings, getFeaturedSettings, saveFeaturedSettings } from '@/lib/settingsService';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTouchSortable } from '@/hooks/useTouchSortable';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableArticleProps {
  id: string;
  index: number;
  article: {
    title: string;
    category: string;
    featuredImage?: string;
    hasVideo?: boolean;
  };
  showImage?: boolean;
  onRemove: () => void;
  getCategoryColor: (category: string) => string;
}

const DraggableArticle = ({ id, index, article, showImage, onRemove, getCategoryColor }: DraggableArticleProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-start sm:items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-sm transition-all hover:shadow-md touch-manipulation',
        isDragging ? 'z-50 opacity-90 shadow-xl scale-[1.02] bg-accent/50 border-primary/50' : 'hover:border-primary/20'
      )}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/0 group-hover:bg-primary/20 transition-colors rounded-l-xl" />

      <button
        type="button"
        className={cn(
          'flex-shrink-0 p-2 -ml-1 rounded-lg cursor-grab active:cursor-grabbing touch-manipulation',
          'hover:bg-muted text-muted-foreground hover:text-foreground transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          isDragging && 'cursor-grabbing text-primary'
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span className="text-3xl font-black italic text-muted-foreground/20 group-hover:text-primary/20 transition-colors select-none">
        #{index + 1}
      </span>

      {showImage && article.featuredImage && (
        <div className="h-10 w-14 sm:h-12 sm:w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted shadow-sm">
          <img
            src={article.featuredImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-semibold text-foreground line-clamp-2 pr-6 leading-tight break-words">{article.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge className={`${getCategoryColor(article.category)} text-white text-[10px] border-0 h-5 px-1.5 shadow-none`}>
            {article.category}
          </Badge>
          {article.hasVideo && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background/50">Video</Badge>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 absolute right-2 top-2 sm:relative sm:top-auto sm:right-auto transition-colors"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const DragOverlayItem = ({ article, showImage, getCategoryColor }: {
  article: { title: string; category: string; featuredImage?: string; hasVideo?: boolean };
  showImage?: boolean;
  getCategoryColor: (category: string) => string;
}) => (
  <div className="relative flex items-center gap-3 p-3 bg-card border-2 border-primary rounded-lg shadow-xl opacity-95 max-w-[calc(100vw-2rem)] overflow-hidden">
    <GripVertical className="h-4 w-4 text-primary" />
    <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0 text-center">•</span>

    {showImage && article.featuredImage && (
      <img
        src={article.featuredImage}
        alt=""
        className="w-10 h-10 object-cover rounded flex-shrink-0 bg-muted"
      />
    )}

    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium line-clamp-2 pr-6 leading-tight break-words">{article.title}</p>
      <div className="flex items-center gap-2 mt-1">
        <Badge className={`${getCategoryColor(article.category)} text-white text-[10px] border-0 h-5 px-1.5`}>
          {article.category}
        </Badge>
        {article.hasVideo && (
          <Badge variant="outline" className="text-[9px] h-5 px-1.5">Video</Badge>
        )}
      </div>
    </div>
  </div>
);

const AdminFeatured = () => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [settings, setSettings] = useState<FeaturedSettings>(getFeaturedSettings());
  const [breakingNewsIds, setBreakingNewsIds] = useState<string[]>(settings.breakingNewsIds);
  const [heroFeaturedIds, setHeroFeaturedIds] = useState<string[]>(settings.heroFeaturedIds);
  const [heroSideArticleIds, setHeroSideArticleIds] = useState<string[]>(settings.heroSideArticleIds || []);

  useEffect(() => {
    const loadArticles = () => setArticlesList(getArticles());
    loadArticles();

    window.addEventListener('articlesUpdated', loadArticles);
    return () => window.removeEventListener('articlesUpdated', loadArticles);
  }, []);

  // Allow all articles (drafts, scheduled, published) to be featured, except rejected ones
  const availableArticles = articlesList.filter(a => (a.status as string) !== 'rejected');

  const getArticleById = (id: string) => availableArticles.find(a => a.id === id);

  const addToBreakingNews = (id: string) => {
    if (!breakingNewsIds.includes(id) && breakingNewsIds.length < settings.maxBreakingNews) {
      setBreakingNewsIds(prev => [...prev, id]);
    }
  };

  const removeFromBreakingNews = (id: string) => {
    setBreakingNewsIds(prev => prev.filter(i => i !== id));
  };

  const addToHeroFeatured = (id: string) => {
    if (!heroFeaturedIds.includes(id) && heroFeaturedIds.length < settings.maxHeroArticles) {
      setHeroFeaturedIds(prev => [...prev, id]);
    }
  };

  const removeFromHeroFeatured = (id: string) => {
    setHeroFeaturedIds(prev => prev.filter(i => i !== id));
  };

  const addToSideArticles = (id: string) => {
    if (!heroSideArticleIds.includes(id) && heroSideArticleIds.length < 4) {
      setHeroSideArticleIds(prev => [...prev, id]);
    }
  };

  const removeFromSideArticles = (id: string) => {
    setHeroSideArticleIds(prev => prev.filter(i => i !== id));
  };

  const handleSave = () => {
    const newSettings: FeaturedSettings = {
      ...settings,
      breakingNewsIds,
      heroFeaturedIds,
      heroSideArticleIds
    };
    saveFeaturedSettings(newSettings);
    setSettings(newSettings);
    toast.success('Featured settings saved successfully');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      national: 'bg-blue-500',
      international: 'bg-purple-500',
      economy: 'bg-amber-500',
      environment: 'bg-emerald-500',
      technology: 'bg-cyan-500',
      sports: 'bg-green-500',
      entertainment: 'bg-fuchsia-500',
    };
    return colors[category] || 'bg-primary';
  };

  // Breaking News drag-and-drop
  const breakingSortable = useTouchSortable({
    items: breakingNewsIds,
    getItemId: (id) => id,
    onReorder: (newIds) => {
      setBreakingNewsIds(newIds);
      toast.success('Breaking news order updated');
    },
  });

  // Hero drag-and-drop
  const heroSortable = useTouchSortable({
    items: heroFeaturedIds,
    getItemId: (id) => id,
    onReorder: (newIds) => {
      setHeroFeaturedIds(newIds);
      toast.success('Hero articles order updated');
    },
  });

  const getActiveArticle = (activeId: string | null) => {
    if (!activeId) return null;
    return getArticleById(activeId);
  };

  return (
    <div className="px-1 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Featured Content</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Control breaking news ticker and hero section
          </p>
        </div>
        <Button onClick={handleSave} size="sm" className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Breaking News Section */}
        <Card>
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <CardTitle className="text-sm sm:text-base truncate">Breaking News</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">{breakingNewsIds.length}/{settings.maxBreakingNews}</Badge>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Drag to reorder • Touch and hold on mobile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-3 sm:px-6">
            {/* Settings */}
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.breakingAutoSwipe ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  <Label>Auto-swipe</Label>
                </div>
                <Switch
                  checked={settings.breakingAutoSwipe}
                  onCheckedChange={(checked) => setSettings({ ...settings, breakingAutoSwipe: checked })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Swipe Interval: {settings.autoSwipeInterval / 1000}s
                </Label>
                <Slider
                  value={[settings.autoSwipeInterval]}
                  onValueChange={([v]) => setSettings({ ...settings, autoSwipeInterval: v })}
                  min={3000}
                  max={10000}
                  step={1000}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Max Headlines: {settings.maxBreakingNews}
                </Label>
                <Slider
                  value={[settings.maxBreakingNews]}
                  onValueChange={([v]) => setSettings({ ...settings, maxBreakingNews: v })}
                  min={3}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Selected Articles with Drag-and-Drop */}
            <div>
              <Label className="text-xs sm:text-sm font-medium">Selected Breaking News Articles</Label>
              <DndContext
                sensors={breakingSortable.sensors}
                collisionDetection={closestCenter}
                onDragStart={breakingSortable.handleDragStart}
                onDragEnd={breakingSortable.handleDragEnd}
                onDragCancel={breakingSortable.handleDragCancel}
              >
                <SortableContext items={breakingNewsIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 mt-2">
                    {breakingNewsIds.map((id, index) => {
                      const article = getArticleById(id);
                      if (!article) return null;
                      return (
                        <DraggableArticle
                          key={id}
                          id={id}
                          index={index}
                          article={article}
                          onRemove={() => removeFromBreakingNews(id)}
                          getCategoryColor={getCategoryColor}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {breakingSortable.activeId && getActiveArticle(breakingSortable.activeId) && (
                    <DragOverlayItem
                      article={getActiveArticle(breakingSortable.activeId)!}
                      getCategoryColor={getCategoryColor}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </div>

            {/* Add Article */}
            {breakingNewsIds.length < settings.maxBreakingNews && (
              <div>
                <Label className="text-sm text-muted-foreground">Add Article</Label>
                <Select onValueChange={addToBreakingNews}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an article to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableArticles
                      .filter(a => !breakingNewsIds.includes(a.id))
                      .map((article) => (
                        <SelectItem key={article.id} value={article.id}>
                          <span className="truncate">
                            {article.title}
                            {article.status !== 'published' && <span className="text-xs text-muted-foreground ml-2">({article.status})</span>}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hero Section */}
        <Card>
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Layout className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <CardTitle className="text-sm sm:text-base truncate">Hero Section</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">{heroFeaturedIds.length}/{settings.maxHeroArticles}</Badge>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Drag to reorder • Touch and hold on mobile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-3 sm:px-6">
            {/* Settings */}
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.heroAutoSwipe ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  <Label>Auto-swipe</Label>
                </div>
                <Switch
                  checked={settings.heroAutoSwipe}
                  onCheckedChange={(checked) => setSettings({ ...settings, heroAutoSwipe: checked })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Max Articles: {settings.maxHeroArticles}
                </Label>
                <Slider
                  value={[settings.maxHeroArticles]}
                  onValueChange={([v]) => setSettings({ ...settings, maxHeroArticles: v })}
                  min={3}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Selected Articles with Drag-and-Drop */}
            <div>
              <Label className="text-xs sm:text-sm font-medium">Featured Hero Articles</Label>
              <DndContext
                sensors={heroSortable.sensors}
                collisionDetection={closestCenter}
                onDragStart={heroSortable.handleDragStart}
                onDragEnd={heroSortable.handleDragEnd}
                onDragCancel={heroSortable.handleDragCancel}
              >
                <SortableContext items={heroFeaturedIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 mt-2">
                    {heroFeaturedIds.map((id, index) => {
                      const article = getArticleById(id);
                      if (!article) return null;
                      return (
                        <DraggableArticle
                          key={id}
                          id={id}
                          index={index}
                          article={article}
                          showImage
                          onRemove={() => removeFromHeroFeatured(id)}
                          getCategoryColor={getCategoryColor}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {heroSortable.activeId && getActiveArticle(heroSortable.activeId) && (
                    <DragOverlayItem
                      article={getActiveArticle(heroSortable.activeId)!}
                      showImage
                      getCategoryColor={getCategoryColor}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </div>

            {/* Add Article */}
            {heroFeaturedIds.length < settings.maxHeroArticles && (
              <div>
                <Label className="text-sm text-muted-foreground">Add Article</Label>
                <Select onValueChange={addToHeroFeatured}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an article to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableArticles
                      .filter(a => !heroFeaturedIds.includes(a.id))
                      .map((article) => (
                        <SelectItem key={article.id} value={article.id}>
                          <span className="truncate">
                            {article.title}
                            {article.status !== 'published' && <span className="text-xs text-muted-foreground ml-2">({article.status})</span>}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Info */}
      <Card className="mt-6">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Layout className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <CardTitle className="text-sm sm:text-base truncate">Hero Side Articles</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">{heroSideArticleIds.length}/4</Badge>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Articles displayed on the right side of the hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 space-y-4">
          {/* Selected Side Articles */}
          <div className="space-y-2">
            {heroSideArticleIds.map((id, index) => {
              const article = getArticleById(id);
              if (!article) return null;
              return (
                <div key={id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{article.title}</p>
                    <Badge className={`${getCategoryColor(article.category)} text-white text-[10px] border-0 mt-1`}>
                      {article.category}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromSideArticles(id)} className="text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Add Side Article */}
          {heroSideArticleIds.length < 4 && (
            <div>
              <Label className="text-sm text-muted-foreground">Add Side Article</Label>
              <Select onValueChange={addToSideArticles}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select an article to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableArticles
                    .filter(a => !heroSideArticleIds.includes(a.id) && !heroFeaturedIds.includes(a.id))
                    .map((article) => (
                      <SelectItem key={article.id} value={article.id}>
                        <span className="truncate">
                          {article.title}
                          {article.status !== 'published' && <span className="text-xs text-muted-foreground ml-2">({article.status})</span>}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle>Quick Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Drag articles</strong> to reorder their display priority</li>
            <li>• <strong>On mobile:</strong> Touch and hold, then drag to reorder</li>
            <li>• Breaking news appears in the red ticker at the top of the page</li>
            <li>• Hero articles are featured in the main carousel with large images</li>
            <li>• <strong>Side articles</strong> appear on the right side of the hero section</li>
            <li>• Changes will be reflected immediately after saving</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeatured;
