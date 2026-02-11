import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, ThumbsUp, Reply, User, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  author: string;
  email?: string;
  content: string;
  articleId: string;
  createdAt: Date;
  likes: number;
  status: 'approved' | 'pending' | 'flagged' | 'spam';
  replies?: Comment[];
}

// Mock comments for demonstration - will be replaced by database
const getMockComments = (articleId: string): Comment[] => [
  {
    id: '1',
    author: 'Rahim Uddin',
    content: 'Very important issue raised here. We need more awareness on this matter.',
    articleId,
    createdAt: new Date('2026-01-16T10:00:00'),
    likes: 12,
    status: 'approved',
    replies: [
      {
        id: '1-1',
        author: 'Fatima Begum',
        content: 'Absolutely agree. The authorities should take note of this immediately.',
        articleId,
        createdAt: new Date('2026-01-16T12:00:00'),
        likes: 5,
        status: 'approved'
      }
    ]
  },
  {
    id: '2',
    author: 'Karim Hasan',
    content: 'Thank you for the detailed report. Identifying the root cause is crucial.',
    articleId,
    createdAt: new Date('2026-01-15T15:00:00'),
    likes: 8,
    status: 'approved'
  }
];

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

  // Load comments from localStorage
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      const stored = localStorage.getItem(`comments_${articleId}`);
      if (stored) {
        setComments(JSON.parse(stored));
      } else {
        // Fallback to mock data ONLY if no local storage exists for this article
        const initialMock = getMockComments(articleId);
        setComments(initialMock);
        // Save initial mock to storage so we can add to it later
        localStorage.setItem(`comments_${articleId}`, JSON.stringify(initialMock));
      }
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

  // Real-time subscription setup - ready for Cloud integration
  useEffect(() => {
    // TODO: Enable real-time updates when connected to Cloud
    // Example with Supabase Realtime:
    // const channel = supabase
    //   .channel('comments-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
    //       schema: 'public',
    //       table: 'comments',
    //       filter: `article_id=eq.${articleId}`
    //     },
    //     (payload) => {
    //       console.log('Comment change:', payload);
    //       if (payload.eventType === 'INSERT' && payload.new.status === 'approved') {
    //         setComments(prev => [payload.new as Comment, ...prev]);
    //         toast.info('New comment posted!');
    //       } else if (payload.eventType === 'DELETE') {
    //         setComments(prev => prev.filter(c => c.id !== payload.old.id));
    //       } else if (payload.eventType === 'UPDATE') {
    //         setComments(prev => prev.map(c => 
    //           c.id === payload.new.id ? payload.new as Comment : c
    //         ));
    //       }
    //     }
    //   )
    //   .subscribe();
    //
    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [articleId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment: Comment = {
        id: Date.now().toString(),
        author: newComment.author,
        email: newComment.email,
        content: newComment.content,
        articleId,
        createdAt: new Date(),
        likes: 0,
        status: 'approved',
        replies: []
      };

      const updatedComments = [comment, ...comments];
      setComments(updatedComments);
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(updatedComments));

      setNewComment({ author: '', email: '', content: '' });
      toast.success('Comment posted successfully!');
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
      await new Promise(resolve => setTimeout(resolve, 300));

      const reply: Comment = {
        id: `${parentId}-${Date.now()}`,
        author: 'Guest User',
        content: replyContent,
        articleId,
        createdAt: new Date(),
        likes: 0,
        status: 'approved'
      };

      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          };
        }
        return comment;
      });

      setComments(updatedComments);
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(updatedComments));

      setReplyingTo(null);
      setReplyContent('');
      toast.success('Reply posted successfully!');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    // TODO: Replace with actual database update when connected to Cloud
    // Example with Supabase:
    // const { error } = await supabase.rpc('increment_likes', { comment_id: commentId });
    // if (error) throw error;

    setComments(comments.map(comment => {
      if (isReply && parentId && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies?.map(reply =>
            reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply
          )
        };
      }
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + 1 };
      }
      return comment;
    }));
  };

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <div className={`${isReply ? 'ml-8 mt-4' : ''}`}>
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{comment.author}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground">{comment.content}</p>
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => handleLike(comment.id, isReply, parentId)}
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

  return (
    <div className="border-t border-border pt-8 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-display text-xl font-bold text-foreground">
          Comments ({comments.length})
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
            {comments.filter(c => c.status === 'approved').map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          {comments.filter(c => c.status === 'approved').length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </>
      )}
    </div>
  );
};
