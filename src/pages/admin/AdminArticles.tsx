import { useState, useEffect } from 'react';
import { categories } from '@/data/mockData';
import { getArticles, upsertArticle, deleteArticle } from '@/lib/articleService';
import { userService, ExtendedAdminUser } from '@/lib/userService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, Search, Image, Video, Save, CheckCircle, XCircle, Clock, Send, AlertCircle, Upload } from 'lucide-react';
import { Article, Category } from '@/types/news';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useActivityLog } from '@/context/ActivityLogContext';

type ArticleStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'scheduled';

interface ExtendedArticle extends Omit<Article, 'status'> {
  status: ArticleStatus;
  submittedBy?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

const AdminArticles = () => {
  const { currentUser, hasPermission } = useAdminAuth();
  const { logActivity } = useActivityLog();

  // Load articles from service
  const [articlesList, setArticlesList] = useState<ExtendedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbAuthors, setDbAuthors] = useState<ExtendedAdminUser[]>([]);

  useEffect(() => {
    const loadAuthors = async () => {
      const authors = await userService.getAuthors();
      setDbAuthors(authors);
    };
    loadAuthors();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const loadedArticles = await getArticles();
      setArticlesList(loadedArticles.map(a => ({
        ...a,
        status: (a.status as ArticleStatus) || 'published', // ensure status exists
        submittedBy: a.author.id // fallback
      })));
    } catch (error) {
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Save changes via upsert instead of bulk save
  const updateArticlesList = (newList: ExtendedArticle[]) => {
    setArticlesList(newList);
    // saveArticles(newList as unknown as Article[]); // deprecated
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewingArticle, setReviewingArticle] = useState<ExtendedArticle | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [editingArticle, setEditingArticle] = useState<ExtendedArticle | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'national' as Category,
    featuredImage: '',
    videoUrl: '',
    tags: '',
    isBreaking: false,
    isFeatured: false,
    status: 'draft' as ArticleStatus,
    publishedAt: undefined,
    authorId: '1',
    manualAuthorName: '', // NEW
    isManualAuthor: false, // NEW
    reviewNote: ''
  });

  // Permission checks
  const canPublishDirectly = hasPermission('publishArticles');
  const canReview = hasPermission('reviewArticles');
  const canSetBreaking = hasPermission('setBreakingNews');
  const canSetFeatured = hasPermission('setFeatured');
  const canEditAll = hasPermission('editAllArticles');
  const canDeleteAll = hasPermission('deleteAllArticles');

  // Filter articles based on user role
  const getVisibleArticles = () => {
    if (canEditAll) {
      return articlesList;
    }
    // Authors/Journalists can only see their own articles
    return articlesList.filter(a => a.submittedBy === currentUser?.id || a.author.id === currentUser?.id);
  };

  const visibleArticles = getVisibleArticles();

  const filteredArticles = visibleArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;

    // Tab filtering
    if (activeTab === 'pending' && article.status !== 'pending_review') return false;
    if (activeTab === 'published' && article.status !== 'published') return false;
    if (activeTab === 'draft' && article.status !== 'draft') return false;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pendingCount = visibleArticles.filter(a => a.status === 'pending_review').length;

  const openCreateDialog = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'national',
      featuredImage: '',
      videoUrl: '',
      tags: '',
      isBreaking: false,
      isFeatured: false,
      status: 'draft',
      publishedAt: undefined,
      reviewNote: '',
      authorId: currentUser?.id || '1',
      manualAuthorName: '',
      isManualAuthor: false
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (article: ExtendedArticle) => {
    // Permission Check:
    // 1. Admins/Editors (canEditAll) can edit ANY article (published or not, any author).
    // 2. Authors/Journalists can only edit their OWN articles.
    const isOwner = article.submittedBy === currentUser?.id || article.author.id === currentUser?.id;

    if (!canEditAll && !isOwner) {
      toast.error('You can only edit your own articles');
      return;
    }

    // Admins can edit published articles freely.
    // Authors might be restricted from editing published articles in the future, but for now we follow the "edit own" rule.

    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      featuredImage: article.featuredImage,
      videoUrl: article.videoUrl || '',
      tags: article.tags.join(', '),
      isBreaking: article.isBreaking,
      isFeatured: article.isFeatured,
      status: article.status,
      publishedAt: article.publishedAt,
      reviewNote: article.reviewNote || '',
      authorId: article.author.id,
      manualAuthorName: article.customAuthor || '',
      isManualAuthor: !!article.customAuthor
    });
    setIsDialogOpen(true);
  };

  const openReviewDialog = (article: ExtendedArticle) => {
    setReviewingArticle(article);
    setReviewNote('');
    setIsReviewDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'featuredImage' | 'videoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB limit mainly for localStorage safety
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      toast.success('File uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const author = dbAuthors.find(a => a.id === formData.authorId);
    // If no author found (shouldn't happen if loaded), fallback to current user or first in list
    const finalAuthor = author || dbAuthors[0] || (currentUser as ExtendedAdminUser);

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const articleData: Partial<ExtendedArticle> = {
        id: editingArticle?.id,
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        author: {
          ...finalAuthor,
          bio: finalAuthor.bio || '',
          avatar: finalAuthor.avatar || '',
          role: finalAuthor.role as any // cast compatible roles
        },
        customAuthor: formData.isManualAuthor ? formData.manualAuthorName : null,
        featuredImage: formData.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200',
        videoUrl: formData.videoUrl || undefined,
        hasVideo: !!formData.videoUrl,
        tags: tagsArray,
        isBreaking: canSetBreaking ? formData.isBreaking : (editingArticle?.isBreaking || false),
        isFeatured: canSetFeatured ? formData.isFeatured : (editingArticle?.isFeatured || false),
        status: formData.status,
        updatedAt: new Date(),
        submittedBy: editingArticle?.submittedBy || currentUser?.id
      };

      await upsertArticle(articleData as Article);

      logActivity(editingArticle ? 'update' : 'create', 'article', {
        resourceId: editingArticle?.id || 'new',
        resourceName: formData.title,
        details: editingArticle ? 'Updated article content' : `Created new article in ${formData.category} category`
      });

      toast.success(editingArticle ? 'Article updated successfully!' : 'Article created successfully!');
      fetchArticles(); // Refresh from DB
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save article');
    }
  };

  const handleSubmitForReview = async (article: ExtendedArticle) => {
    try {
      await upsertArticle({
        ...article,
        status: 'pending_review',
        updatedAt: new Date()
      } as Article);

      logActivity('submit_review', 'article', {
        resourceId: article.id,
        resourceName: article.title,
        details: 'Submitted article for editorial review'
      });
      toast.success('Article submitted for review!');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to submit for review');
    }
  };

  const handleApprove = async () => {
    if (!reviewingArticle) return;

    try {
      await upsertArticle({
        ...reviewingArticle,
        status: 'published',
        publishedAt: new Date(),
        reviewedBy: currentUser?.id,
        reviewNote: reviewNote || undefined,
        updatedAt: new Date()
      } as Article);

      logActivity('approve', 'article', {
        resourceId: reviewingArticle.id,
        resourceName: reviewingArticle.title,
        details: reviewNote ? `Approved with note: ${reviewNote}` : 'Approved and published'
      });
      setIsReviewDialogOpen(false);
      toast.success('Article approved and published!');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to approve article');
    }
  };

  const handleReject = async () => {
    if (!reviewingArticle || !reviewNote.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await upsertArticle({
        ...reviewingArticle,
        status: 'rejected',
        reviewedBy: currentUser?.id,
        reviewNote: reviewNote,
        updatedAt: new Date()
      } as Article);

      logActivity('reject', 'article', {
        resourceId: reviewingArticle.id,
        resourceName: reviewingArticle.title,
        details: `Rejected: ${reviewNote}`
      });
      setIsReviewDialogOpen(false);
      toast.success('Article rejected');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to reject article');
    }
  };

  const handleDelete = async (id: string) => {
    const article = articlesList.find(a => a.id === id);
    if (!article) return;

    // Check permissions
    if (!canDeleteAll && article.submittedBy !== currentUser?.id && article.author.id !== currentUser?.id) {
      toast.error('You can only delete your own articles');
      return;
    }

    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
        logActivity('delete', 'article', {
          resourceId: id,
          resourceName: article.title,
          details: 'Permanently deleted article'
        });
        toast.success('Article deleted successfully!');
        fetchArticles();
      } catch (error) {
        toast.error('Failed to delete article');
      }
    }
  };

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Published</Badge>;
      case 'pending_review':
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Rejected</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Scheduled</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Draft</Badge>;
    }
  };

  // Determine available statuses based on permissions
  const getAvailableStatuses = () => {
    if (canPublishDirectly) {
      return [
        { value: 'draft', label: 'Draft' },
        { value: 'pending_review', label: 'Submit for Review' },
        { value: 'published', label: 'Publish Now' },
        { value: 'scheduled', label: 'Schedule' },
      ];
    }
    return [
      { value: 'draft', label: 'Draft' },
      { value: 'pending_review', label: 'Submit for Review' },
    ];
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Articles</h1>
          {!canEditAll && (
            <p className="text-sm text-muted-foreground">Showing your articles only</p>
          )}
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Role-specific alerts */}
      {!canPublishDirectly && (
        <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            Your articles will be submitted for review before publishing. An editor or admin will review and approve them.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {canReview && (
            <TabsTrigger value="pending" className="relative">
              Pending Review
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles Table */}
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Article</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Views</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={article.featuredImage}
                        alt=""
                        className="h-10 w-14 rounded object-cover hidden sm:block"
                      />
                      <div>
                        <span className="text-sm font-medium text-foreground line-clamp-1">{article.title}</span>
                        <span className="text-xs text-muted-foreground block">
                          {article.publishedAt instanceof Date && !isNaN(article.publishedAt.getTime())
                            ? format(article.publishedAt, 'MMM d, yyyy')
                            : 'Unknown Date'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="outline" className="capitalize">{(article.category || 'uncategorized').replace('-', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                    {article.customAuthor || article.author?.name || 'Unknown Author'}
                    {article.customAuthor && <Badge variant="outline" className="ml-2 text-[10px] h-5">Custom</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {getStatusBadge(article.status)}
                      {article.isBreaking && (
                        <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Breaking</Badge>
                      )}
                    </div>
                    {article.status === 'rejected' && article.reviewNote && (
                      <p className="text-xs text-red-500 mt-1 line-clamp-1" title={article.reviewNote}>
                        {article.reviewNote}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {article.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/article/${article.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>

                      {/* Review button for pending articles */}
                      {canReview && article.status === 'pending_review' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-orange-500"
                          onClick={() => openReviewDialog(article)}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Submit for review button for drafts */}
                      {!canPublishDirectly && article.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500"
                          onClick={() => handleSubmitForReview(article)}
                          title="Submit for Review"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(article)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredArticles.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No articles found</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-card rounded-xl border border-border p-4 space-y-3 shadow-sm">
            <div className="flex gap-3">
              <img
                src={article.featuredImage}
                alt=""
                className="h-16 w-24 rounded-lg object-cover flex-shrink-0 bg-muted"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-foreground text-sm line-clamp-2 leading-tight">{article.title}</h4>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="truncate">By {article.customAuthor || article.author?.name || 'Unknown'}</span>
                  <span>•</span>
                  <span>{article.publishedAt instanceof Date && !isNaN(article.publishedAt.getTime())
                    ? format(article.publishedAt, 'MMM d, yyyy')
                    : 'Unknown Date'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Badge variant="outline" className="capitalize text-xs">{(article.category || 'uncategorized').replace('-', ' ')}</Badge>
              <div className="flex gap-1">
                {getStatusBadge(article.status)}
                {article.isBreaking && (
                  <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-[10px] px-1.5">Breaking</Badge>
                )}
              </div>
            </div>

            {article.status === 'rejected' && article.reviewNote && (
              <div className="bg-red-500/10 text-red-600 text-xs p-2 rounded">
                <strong>Rejection Note:</strong> {article.reviewNote}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-2">
              <div className="text-xs text-muted-foreground">
                {article.views.toLocaleString()} views
              </div>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={`/article/${article.slug}`} target="_blank">
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>

                {/* Review button for pending articles */}
                {canReview && article.status === 'pending_review' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-orange-500"
                    onClick={() => openReviewDialog(article)}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                )}

                {/* Submit for review button for drafts */}
                {!canPublishDirectly && article.status === 'draft' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500"
                    onClick={() => handleSubmitForReview(article)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(article)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(article.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="py-12 text-center bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No articles found</p>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Article</DialogTitle>
            <DialogDescription>
              Review this article submission and approve or reject it.
            </DialogDescription>
          </DialogHeader>

          {reviewingArticle && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">{reviewingArticle.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{reviewingArticle.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>By {reviewingArticle.customAuthor || reviewingArticle.author?.name || 'Unknown'}</span>
                  <span>•</span>
                  <Badge variant="outline" className="capitalize">{reviewingArticle.category}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewNote">Review Note (required for rejection)</Label>
                <Textarea
                  id="reviewNote"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add feedback for the author..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Publish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
            <DialogDescription>
              {editingArticle ? 'Update the article details below.' : 'Fill in the details to create a new article.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Article title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the article"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full article content..."
                rows={8}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val as Category })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {canEditAll && (
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Select value={formData.authorId} onValueChange={(val) => setFormData({ ...formData, authorId: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dbAuthors.map(author => (
                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Custom Author Name Toggle */}
            {canEditAll && (
              <div className="space-y-3 border p-4 rounded-lg bg-muted/20">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="manual-author"
                    checked={formData.isManualAuthor}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isManualAuthor: checked }))}
                  />
                  <Label htmlFor="manual-author">Use Custom Author Name</Label>
                </div>

                {formData.isManualAuthor && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="manualAuthorName">Author Name *</Label>
                    <Input
                      id="manualAuthorName"
                      value={formData.manualAuthorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, manualAuthorName: e.target.value }))}
                      placeholder="Enter custom author name"
                      required={formData.isManualAuthor}
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will be displayed on the article instead of the selected user.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">Image URL</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="relative mt-2">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                      placeholder="https://..."
                      className="pl-9"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'featuredImage')}
                        className="cursor-pointer"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                {formData.featuredImage && (
                  <div className="mt-2 h-32 w-full overflow-hidden rounded-md border border-border bg-muted">
                    <img src={formData.featuredImage} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Video (optional)</Label>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">Video URL</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="relative mt-2">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="pl-9"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'videoUrl')}
                        className="cursor-pointer"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                {formData.videoUrl && (
                  <div className="mt-2 p-2 bg-muted/50 rounded border border-border">
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Video source set
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-1">
                      {formData.videoUrl.substring(0, 50)}...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="news, breaking, politics"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as ArticleStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStatuses().map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {canSetBreaking && (
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="isBreaking"
                    checked={formData.isBreaking}
                    onCheckedChange={(checked) => setFormData({ ...formData, isBreaking: checked })}
                  />
                  <Label htmlFor="isBreaking">Breaking News</Label>
                </div>
              )}

              {canSetFeatured && (
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              )}
            </div>

            {!canSetBreaking && !canSetFeatured && (
              <p className="text-xs text-muted-foreground">
                Note: Breaking News and Featured flags can only be set by editors and admins.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingArticle ? 'Update Article' : 'Save Article'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminArticles;
