import { Comment } from '@/components/news/CommentSection';
import { getArticles } from './articleService';

const COMMENTS_KEY_PREFIX = 'comments_';
const ALL_COMMENTS_KEY = 'truthlens_all_comments_index';

// Get all comment keys from localStorage
export const getAllCommentKeys = (): string[] => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(COMMENTS_KEY_PREFIX)) {
            keys.push(key);
        }
    }
    return keys;
};

// Get all comments across all articles
export const getAllComments = (): Comment[] => {
    const articles = getArticles();
    const articleMap = new Map(articles.map(a => [a.id, { title: a.title, slug: a.slug }]));

    const allComments: Comment[] = [];
    const keys = getAllCommentKeys();

    keys.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const comments: Comment[] = JSON.parse(data);
                // Add article metadata
                const articleId = key.replace(COMMENTS_KEY_PREFIX, '');
                const articleInfo = articleMap.get(articleId);

                comments.forEach(comment => {
                    // Flatten replies
                    allComments.push({
                        ...comment,
                        createdAt: new Date(comment.createdAt),
                        articleTitle: articleInfo?.title || 'Unknown Article',
                        articleSlug: articleInfo?.slug || '',
                    } as any);

                    // Add replies as separate entries
                    if (comment.replies) {
                        comment.replies.forEach(reply => {
                            allComments.push({
                                ...reply,
                                createdAt: new Date(reply.createdAt),
                                articleTitle: articleInfo?.title || 'Unknown Article',
                                articleSlug: articleInfo?.slug || '',
                                isReply: true,
                                parentId: comment.id,
                            } as any);
                        });
                    }
                });
            }
        } catch (e) {
            console.error('Error parsing comments for key:', key, e);
        }
    });

    // Sort by createdAt descending
    allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allComments;
};

// Update comment status
export const updateCommentStatus = (articleId: string, commentId: string, status: Comment['status']) => {
    const key = COMMENTS_KEY_PREFIX + articleId;
    const data = localStorage.getItem(key);
    if (data) {
        const comments: Comment[] = JSON.parse(data);
        const updateStatus = (comment: Comment): Comment => {
            if (comment.id === commentId) {
                return { ...comment, status };
            }
            if (comment.replies) {
                return { ...comment, replies: comment.replies.map(updateStatus) };
            }
            return comment;
        };
        const updated = comments.map(updateStatus);
        localStorage.setItem(key, JSON.stringify(updated));
        window.dispatchEvent(new Event('commentsUpdated'));
    }
};

// Delete comment
export const deleteComment = (articleId: string, commentId: string) => {
    const key = COMMENTS_KEY_PREFIX + articleId;
    const data = localStorage.getItem(key);
    if (data) {
        const comments: Comment[] = JSON.parse(data);

        // Check if it's a top-level comment or a reply
        const filtered = comments.filter(c => c.id !== commentId).map(c => {
            if (c.replies) {
                return { ...c, replies: c.replies.filter(r => r.id !== commentId) };
            }
            return c;
        });

        localStorage.setItem(key, JSON.stringify(filtered));
        window.dispatchEvent(new Event('commentsUpdated'));
    }
};

// Save comments for an article (used by CommentSection)
export const saveComments = (articleId: string, comments: Comment[]) => {
    const key = COMMENTS_KEY_PREFIX + articleId;
    localStorage.setItem(key, JSON.stringify(comments));
    window.dispatchEvent(new Event('commentsUpdated'));
};

// Get comments for an article
export const getComments = (articleId: string): Comment[] => {
    const key = COMMENTS_KEY_PREFIX + articleId;
    const data = localStorage.getItem(key);
    if (!data) return [];
    try {
        return JSON.parse(data).map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            replies: c.replies?.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) }))
        }));
    } catch {
        return [];
    }
};
