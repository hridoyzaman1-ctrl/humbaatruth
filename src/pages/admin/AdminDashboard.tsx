import { useState, useEffect } from 'react';
import { FileText, Eye, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useActivityLog, formatAction, formatResource, getActionColor } from '@/context/ActivityLogContext';
import { ROLE_DISPLAY } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const { currentUser, hasPermission } = useAdminAuth();
  const { logs } = useActivityLog();

  const canViewFullDashboard = hasPermission('viewFullDashboard');
  const canReview = hasPermission('reviewArticles');
  const isAdmin = currentUser?.role === 'admin';

  // Load live data
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  useEffect(() => {
    setArticlesList(getArticles());
  }, []);

  // Mock pending articles count (or derived if we had status persistence for everyone)
  const pendingArticles = articlesList.filter(a => (a as any).status === 'pending_review').length; // Fallback or mock

  // Get recent activity (last 5 logs) - admins see all, others see their own
  const recentActivity = isAdmin
    ? logs.slice(0, 5)
    : logs.filter(log => log.userId === currentUser?.id).slice(0, 5);

  // Stats for full dashboard (admin/editor)
  const fullStats = [
    { label: 'Total Articles', value: articlesList.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Views', value: articlesList.reduce((a, b) => a + b.views, 0).toLocaleString(), icon: Eye, color: 'bg-green-500' },
    { label: 'Authors', value: '4', icon: Users, color: 'bg-purple-500' },
    { label: 'Breaking News', value: articlesList.filter(a => a.isBreaking).length, icon: TrendingUp, color: 'bg-red-500' },
  ];

  // Stats for authors/journalists (own stats only)
  const ownStats = [
    { label: 'Your Articles', value: '5', icon: FileText, color: 'bg-blue-500' },
    { label: 'Your Views', value: '12,450', icon: Eye, color: 'bg-green-500' },
    { label: 'Pending Review', value: '2', icon: Clock, color: 'bg-orange-500' },
    { label: 'Published', value: '3', icon: CheckCircle, color: 'bg-emerald-500' },
  ];

  const stats = canViewFullDashboard ? fullStats : ownStats;
  const roleInfo = currentUser ? ROLE_DISPLAY[currentUser.role] : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          {currentUser && roleInfo && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Welcome back,</span>
              <span className="text-sm font-medium">{currentUser.name}</span>
              <Badge className={`${roleInfo.color} text-white text-xs border-0`}>
                {roleInfo.label}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Pending Review Alert for Editors/Admins */}
      {canReview && pendingArticles > 0 && (
        <Card className="mb-6 border-orange-500/50 bg-orange-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{pendingArticles} articles pending review</p>
              <p className="text-sm text-muted-foreground">New submissions are waiting for your approval</p>
            </div>
            <a href="/admin/articles" className="text-sm text-primary hover:underline">
              Review Now →
            </a>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card p-6 border border-border">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} mb-4`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Articles */}
        <div className="rounded-xl bg-card p-6 border border-border">
          <h2 className="font-display text-lg font-semibold mb-4">
            {canViewFullDashboard ? 'Recent Articles' : 'Your Recent Articles'}
          </h2>
          <div className="space-y-3">
            {articlesList.slice(0, 5).map((article) => (
              <div key={article.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="h-12 w-12 sm:h-10 sm:w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {article.featuredImage ? (
                    <img src={article.featuredImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-full w-full p-3 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight break-words mb-1">{article.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views.toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Widget */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              {isAdmin ? 'Recent Activity' : 'Your Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log) => {
                  const actionColorClass = getActionColor(log.action);
                  return (
                    <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                      <Badge variant="outline" className={`${actionColorClass} text-xs mt-0.5`}>
                        {formatAction(log.action)}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          <span className="font-medium">{log.userName}</span>
                          <span className="text-muted-foreground"> · </span>
                          <span>{formatResource(log.resource)}</span>
                        </p>
                        {log.resourceName && (
                          <p className="text-xs text-muted-foreground truncate">{log.resourceName}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {isAdmin && logs.length > 5 && (
              <a
                href="/admin/activity-log"
                className="block text-center text-sm text-primary hover:underline mt-4"
              >
                View all activity →
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;