import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Clock, Loader2 } from 'lucide-react';
import { getLatestApprovedComments, Comment } from '@/lib/commentService';
import { formatDistanceToNow } from 'date-fns';

export const HomepageComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getLatestApprovedComments(10);
        setComments(data);
      } catch (err) {
        console.error('Failed to load homepage comments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading reader reactions...</p>
      </div>
    );
  }

  if (comments.length === 0) return null;

  return (
    <section className="py-12 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Reader Comments</h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {comments.map((comment) => (
            <Link
              key={comment.id}
              to={`/article/${comment.articleSlug}#comments-section`}
              className="group bg-card hover:bg-card/80 border border-border rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 block h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-medium text-primary line-clamp-1 flex-1">Re: {comment.articleTitle}</span>
              </div>
              <p className="text-sm text-foreground italic line-clamp-3 mb-4 flex-1">
                "{comment.content}"
              </p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {comment.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">{comment.author}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="h-3 w-3" />
                  {comment.likes}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
