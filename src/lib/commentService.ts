import { supabase } from './supabase';

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
    articleTitle?: string;
    articleSlug?: string;
}

// Get comments for a specific article
export const getComments = async (articleId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    // Group into parent/child structure
    const allComments: Comment[] = data.map(c => ({
        id: c.id,
        author: c.author_name,
        email: c.author_email,
        content: c.content,
        articleId: c.article_id,
        createdAt: new Date(c.created_at),
        likes: c.likes,
        status: c.status,
        parent_id: c.parent_id
    } as any));

    const parents = allComments.filter(c => !(c as any).parent_id);
    parents.forEach(p => {
        p.replies = allComments.filter(c => (c as any).parent_id === p.id);
    });

    return parents;
};

// Get top 10 approved comments globally (for homepage)
export const getLatestApprovedComments = async (limit = 10): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from('comments')
        .select(`
      *,
      articles (
        title,
        slug
      )
    `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching latest comments:', error);
        return [];
    }

    return data.map(c => ({
        id: c.id,
        author: c.author_name,
        content: c.content,
        articleId: c.article_id,
        createdAt: new Date(c.created_at),
        likes: c.likes,
        status: c.status,
        articleTitle: (c.articles as any)?.title || 'Unknown Article',
        articleSlug: (c.articles as any)?.slug || ''
    } as any));
};

// Post a new comment
export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'status' | 'replies'>) => {
    const { data, error } = await supabase
        .from('comments')
        .insert({
            article_id: comment.articleId,
            author_name: comment.author,
            author_email: comment.email,
            content: comment.content,
            parent_id: (comment as any).parent_id,
            status: 'approved' // Default to approved for now as requested
        })
        .select()
        .single();

    if (error) throw error;
    window.dispatchEvent(new Event('commentsUpdated'));
    return data;
};

// Admin: Get all comments for moderation
export const getAllComments = async (): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from('comments')
        .select(`
      *,
      articles (
        title,
        slug
      )
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all comments:', error);
        return [];
    }

    return data.map(c => ({
        id: c.id,
        author: c.author_name,
        email: c.author_email,
        content: c.content,
        articleId: c.article_id,
        createdAt: new Date(c.created_at),
        likes: c.likes,
        status: c.status,
        articleTitle: (c.articles as any)?.title || 'Unknown Article',
        articleSlug: (c.articles as any)?.slug || '',
        isReply: !!c.parent_id
    } as any));
};

// Update comment status
export const updateCommentStatus = async (commentId: string, status: string) => {
    const { error } = await supabase
        .from('comments')
        .update({ status })
        .eq('id', commentId);

    if (error) throw error;
    window.dispatchEvent(new Event('commentsUpdated'));
};

// Delete comment
export const deleteComment = async (commentId: string) => {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) throw error;
    window.dispatchEvent(new Event('commentsUpdated'));
};

// Increment likes
export const incrementCommentLikes = async (commentId: string) => {
    const { error } = await supabase.rpc('increment_comment_likes', { comment_id: commentId });
    if (error) throw error;
};

