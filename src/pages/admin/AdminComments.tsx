import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Trash2,
  Search,
  Eye,
  Flag,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  ThumbsUp,
  ExternalLink,
  Filter,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getAllComments, updateCommentStatus, deleteComment as deleteCommentService } from '@/lib/commentService';

interface Comment {
  id: string;
  author: string;
  email?: string;
  content: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  createdAt: Date;
  likes: number;
  status: 'approved' | 'pending' | 'flagged' | 'spam';
  parentId?: string;
  isReply: boolean;
}

const AdminComments = () => {
  const { hasPermission } = useAdminAuth();
  const { logActivity } = useActivityLog();
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const loadComments = useCallback(() => {
    const allComments = getAllComments() as Comment[];
    setComments(allComments);
  }, []);

  useEffect(() => {
    loadComments();
    window.addEventListener('commentsUpdated', loadComments);
    return () => window.removeEventListener('commentsUpdated', loadComments);
  }, [loadComments]);

  const canViewComments = hasPermission('viewAllComments');
  const canModerateComments = hasPermission('moderateComments');

  // If user doesn't have permission, show restricted view
  if (!canViewComments) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to view all comments. Only editors and administrators can access this section.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case 'flagged':
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Flagged</Badge>;
      case 'spam':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Spam</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch =
      comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.articleTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      deleteCommentService(comment.articleId, commentId);
      loadComments();
      logActivity('delete', 'comment', {
        resourceId: commentId,
        resourceName: comment?.author,
        details: `Deleted comment on "${comment?.articleTitle}"`
      });
      toast.success('Comment deleted successfully');
    }
  };

  const handleBulkDelete = (status: string) => {
    const toDelete = comments.filter(c => c.status === status);
    toDelete.forEach(c => deleteCommentService(c.articleId, c.id));
    loadComments();
    logActivity('bulk_delete', 'comment', {
      details: `Bulk deleted ${toDelete.length} ${status} comments`
    });
    toast.success(`${toDelete.length} ${status} comments deleted`);
  };

  const handleApprove = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      updateCommentStatus(comment.articleId, commentId, 'approved');
      loadComments();
      logActivity('approve', 'comment', {
        resourceId: commentId,
        resourceName: comment?.author,
        details: `Approved comment on "${comment?.articleTitle}"`
      });
      toast.success('Comment approved');
    }
  };

  const handleFlag = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      updateCommentStatus(comment.articleId, commentId, 'flagged');
      loadComments();
      logActivity('flag', 'comment', {
        resourceId: commentId,
        resourceName: comment?.author,
        details: `Flagged comment for review`
      });
      toast.success('Comment flagged for review');
    }
  };

  const handleMarkSpam = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      updateCommentStatus(comment.articleId, commentId, 'spam');
      loadComments();
      logActivity('flag', 'comment', {
        resourceId: commentId,
        resourceName: comment?.author,
        details: `Marked comment as spam`
      });
      toast.success('Comment marked as spam');
    }
  };

  const viewComment = (comment: Comment) => {
    setSelectedComment(comment);
    setViewDialogOpen(true);
  };

  const stats = {
    total: comments.length,
    approved: comments.filter(c => c.status === 'approved').length,
    pending: comments.filter(c => c.status === 'pending').length,
    flagged: comments.filter(c => c.status === 'flagged').length,
    spam: comments.filter(c => c.status === 'spam').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Comments Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and moderate reader comments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs text-muted-foreground">Approved</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.flagged}</div>
          <div className="text-xs text-muted-foreground">Flagged</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-2xl font-bold text-red-600">{stats.spam}</div>
          <div className="text-xs text-muted-foreground">Spam</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments, authors, articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>

        {/* Bulk Actions */}
        {stats.spam > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete All Spam ({stats.spam})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all spam comments?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {stats.spam} spam comments. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleBulkDelete('spam')} className="bg-destructive text-destructive-foreground">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Comments Table */}
      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Author</TableHead>
                <TableHead className="min-w-[250px]">Comment</TableHead>
                <TableHead className="min-w-[200px]">Article</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No comments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground text-sm truncate">{comment.author}</div>
                          {comment.email && (
                            <div className="text-xs text-muted-foreground truncate">{comment.email}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {comment.isReply && (
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">Reply</Badge>
                        )}
                        <p className="text-sm text-foreground line-clamp-2">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {comment.likes} likes
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/article/${comment.articleSlug}`}
                        className="text-sm text-primary hover:underline line-clamp-2"
                        target="_blank"
                      >
                        {comment.articleTitle}
                      </Link>
                    </TableCell>
                    <TableCell>{getStatusBadge(comment.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">
                        {format(comment.createdAt, 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => viewComment(comment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {canModerateComments && comment.status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(comment.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {canModerateComments && comment.status !== 'flagged' && comment.status !== 'spam' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => handleFlag(comment.id)}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        )}

                        {canModerateComments && comment.status !== 'spam' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleMarkSpam(comment.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {canModerateComments && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-background">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this comment by {comment.author}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(comment.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            No comments found
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="bg-card rounded-xl border border-border p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{comment.author}</div>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</div>
                  </div>
                </div>
                {getStatusBadge(comment.status)}
              </div>

              <div className="space-y-2">
                {comment.isReply && <Badge variant="outline" className="text-[10px]">Reply</Badge>}
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>

              <div className="bg-muted/30 p-2 rounded text-xs border border-border/50">
                <span className="text-muted-foreground">On: </span>
                <Link to={`/article/${comment.articleSlug}`} className="font-medium text-primary hover:underline">
                  {comment.articleTitle}
                </Link>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="h-3 w-3" /> {comment.likes}
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewComment(comment)}>
                    <Eye className="h-4 w-4" />
                  </Button>

                  {canModerateComments && comment.status !== 'approved' && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleApprove(comment.id)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}

                  {canModerateComments && comment.status !== 'flagged' && comment.status !== 'spam' && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600" onClick={() => handleFlag(comment.id)}>
                      <Flag className="h-4 w-4" />
                    </Button>
                  )}

                  {canModerateComments && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this comment by {comment.author}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(comment.id)} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Comment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-background max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
            <DialogDescription>Full comment information and moderation options</DialogDescription>
          </DialogHeader>

          {selectedComment && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{selectedComment.author}</span>
                    {getStatusBadge(selectedComment.status)}
                    {selectedComment.isReply && <Badge variant="outline">Reply</Badge>}
                  </div>
                  {selectedComment.email && (
                    <p className="text-sm text-muted-foreground">{selectedComment.email}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(selectedComment.createdAt, 'PPpp')}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {selectedComment.likes} likes
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Comment</h4>
                <p className="text-foreground bg-card p-4 rounded-lg border border-border">
                  {selectedComment.content}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Article</h4>
                <Link
                  to={`/article/${selectedComment.articleSlug}`}
                  target="_blank"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  {selectedComment.articleTitle}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {selectedComment.status !== 'approved' && (
                  <Button
                    size="sm"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedComment.id);
                      setSelectedComment({ ...selectedComment, status: 'approved' });
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                )}
                {selectedComment.status !== 'flagged' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      handleFlag(selectedComment.id);
                      setSelectedComment({ ...selectedComment, status: 'flagged' });
                    }}
                  >
                    <Flag className="h-4 w-4" />
                    Flag
                  </Button>
                )}
                {selectedComment.status !== 'spam' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      handleMarkSpam(selectedComment.id);
                      setSelectedComment({ ...selectedComment, status: 'spam' });
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Mark Spam
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleDelete(selectedComment.id);
                          setViewDialogOpen(false);
                        }}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminComments;