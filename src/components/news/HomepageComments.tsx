import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getArticles } from '@/lib/articleService';
import { formatDistanceToNow } from 'date-fns';

// Mock comments data linked to real articles
const recentComments = [
  {
    id: '1',
    articleId: '5',
    articleTitle: 'Why hospital bills scare Dhaka patients more than disease',
    author: 'Rahim Uddin',
    avatar: 'https://ui-avatars.com/api/?name=Rahim+U&background=random',
    content: 'This is the reality for so many middle-class families. The costs are simply unsustainable.',
    likes: 156,
    createdAt: new Date('2026-01-17T11:30:00')
  },
  {
    id: '2',
    articleId: '7',
    articleTitle: 'Toxic waste in our rivers: Stop this threat immediately',
    author: 'Fatima Begum',
    avatar: 'https://ui-avatars.com/api/?name=Fatima+B&background=random',
    content: 'We see the pollution every day. When will the authorities actually enforce the laws?',
    likes: 89,
    createdAt: new Date('2026-01-17T08:45:00')
  },
  {
    id: '3',
    articleId: '9',
    articleTitle: 'Watch / No more silence: Akram urges BCB to show courage',
    author: 'Cricket Fan BD',
    avatar: 'https://ui-avatars.com/api/?name=CF&background=random',
    content: 'Akram Bhai is right. We need strong leadership in BCB now more than ever.',
    likes: 243,
    createdAt: new Date('2026-01-17T12:15:00')
  },
  {
    id: '4',
    articleId: '10',
    articleTitle: 'In Focus / The untold history of why Khaleda Zia entered politics',
    author: 'History Buff',
    avatar: 'https://ui-avatars.com/api/?name=HB&background=random',
    content: 'A fascinating look back. Her journey was far from easy given the political climate of that time.',
    likes: 112,
    createdAt: new Date('2026-01-15T16:20:00')
  }
];

export const HomepageComments = () => {
  const getArticleSlug = (articleId: string) => {
    const articles = getArticles();
    const article = articles.find(a => a.id === articleId);
    return article?.slug || '';
  };

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
              Reader Comments
            </h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentComments.map((comment) => (
            <Link
              key={comment.id}
              to={`/article/${getArticleSlug(comment.articleId)}`}
              className="group block rounded-xl bg-card border border-border p-4 hover:shadow-lg transition-all"
            >
              {/* Article Reference */}
              <p className="text-xs text-primary font-medium line-clamp-1 mb-3">
                Re: {comment.articleTitle}
              </p>

              {/* Comment Content */}
              <p className="text-sm text-foreground line-clamp-3 mb-4">
                "{comment.content}"
              </p>

              {/* Author & Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-foreground">{comment.author}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {comment.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(comment.createdAt, { addSuffix: false })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
