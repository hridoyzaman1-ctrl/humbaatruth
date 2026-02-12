import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, ThumbsUp, Reply, User, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { getComments, addComment, incrementCommentLikes, Comment } from '@/lib/commentService';

interface CommentSectionProps {
  articleId: string;
}

export const CommentSection = ({ articleId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState({ author: '', email: '', content: '' });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getComments(articleId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const handleCommentsUpdate = () => {
      fetchComments();
    };
    window.addEventListener('commentsUpdated', handleCommentsUpdate);
    return () => {
      window.removeEventListener('commentsUpdated', handleCommentsUpdate);
    };
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment({
        author: newComment.author,
        email: newComment.email,
        content: newComment.content,
        articleId
      });

      setNewComment({ author: '', email: '', content: '' });
      toast.success('Comment posted successfully!');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment({
        author: 'Guest User',
        content: replyContent,
        articleId,
        parent_id: parentId // This is passed to Supabase
      } as any);

      setReplyingTo(null);
      setReplyContent('');
      toast.success('Reply posted successfully!');
      fetchComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await incrementCommentLikes(commentId);
      fetchComments();
    } catch (err) {
      toast.error('Failed to like comment');
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => {
    // Defensive date handling to prevent crashes
    const displayDate = (date: any) => {
      try {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return 'Recently';
        return formatDistanceToNow(d, { addSuffix: true });
      } catch (e) {
        return 'Recently';
      }
    };

    return (
      <div className={`${isReply ? 'ml-8 mt-4' : ''}`}>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{comment.author}</span>
              <span className="text-xs text-muted-foreground">
                {displayDate(comment.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground">{comment.content}</p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
                {comment.likes > 0 && comment.likes}
              </button>
              {!isReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4 flex gap-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="flex-1"
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="border-l-2 border-border pl-4 mt-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply parentId={comment.id} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-t border-border pt-8 mt-8" id="comments-section">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-display text-xl font-bold text-foreground">
          Comments ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8 p-4 rounded-xl bg-muted/50">
        <h4 className="font-medium text-foreground mb-4">Leave a Comment</h4>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="author">Name *</Label>
              <Input
                id="author"
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                placeholder="Your name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={newComment.email}
                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="content">Comment *</Label>
            <Textarea
              id="content"
              value={newComment.content}
              onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
              placeholder="Share your thoughts..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </Button>
        </div>
      </form>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading comments...</span>
        </div>
      ) : (
        <>
          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          {comments.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </>
      )}
    </div>
  );
};
