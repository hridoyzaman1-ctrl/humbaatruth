import { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Trash2, 
  User, 
  Clock, 
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  useActivityLog, 
  formatAction, 
  formatResource, 
  getActionColor,
  ActivityAction,
  ActivityResource 
} from '@/context/ActivityLogContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const AdminActivityLog = () => {
  const { hasPermission } = useAdminAuth();
  const { logs, clearLogs, getRecentLogs } = useActivityLog();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Only admins can view full activity logs
  const canViewLogs = hasPermission('manageSettings');

  if (!canViewLogs) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to view activity logs. Only administrators can access this section.
        </p>
      </div>
    );
  }

  // Get unique users from logs
  const uniqueUsers = [...new Set(logs.map(log => log.userName))];

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatAction(log.action).toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatResource(log.resource).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter;
    const matchesUser = userFilter === 'all' || log.userName === userFilter;
    
    return matchesSearch && matchesAction && matchesResource && matchesUser;
  });

  // Stats
  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(log.timestamp) >= today;
    }).length,
    creates: logs.filter(log => log.action === 'create').length,
    updates: logs.filter(log => log.action === 'update').length,
    deletes: logs.filter(log => log.action === 'delete').length,
  };

  const handleClearLogs = () => {
    clearLogs();
    toast.success('Activity logs cleared');
  };

  const handleExportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Resource Name', 'Details'].join(','),
      ...filteredLogs.map(log => [
        format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        log.userName,
        log.userRole,
        formatAction(log.action),
        formatResource(log.resource),
        log.resourceName || '',
        log.details || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Activity log exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Activity Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track all admin actions and changes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all activity logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {logs.length} activity log entries. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{stats.today}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.creates}</div>
            <div className="text-xs text-muted-foreground">Creates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.updates}</div>
            <div className="text-xs text-muted-foreground">Updates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.deletes}</div>
            <div className="text-xs text-muted-foreground">Deletes</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="publish">Publish</SelectItem>
            <SelectItem value="approve">Approve</SelectItem>
            <SelectItem value="reject">Reject</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="category">Categories</SelectItem>
            <SelectItem value="setting">Settings</SelectItem>
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map(user => (
              <SelectItem key={user} value={user}>{user}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Log List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity logs found</p>
              {logs.length === 0 && (
                <p className="text-sm mt-1">Activity will appear here as admins make changes</p>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{log.userName}</span>
                        <Badge variant="outline" className="text-[10px]">{log.userRole}</Badge>
                        <Badge className={`${getActionColor(log.action)} text-[10px]`}>
                          {formatAction(log.action)}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {formatResource(log.resource)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 truncate">
                        {log.resourceName && (
                          <span className="font-medium text-foreground">{log.resourceName}</span>
                        )}
                        {log.details && (
                          <span className="ml-1">{log.details}</span>
                        )}
                        {!log.resourceName && !log.details && (
                          <span>{formatAction(log.action)} {formatResource(log.resource).toLowerCase()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-center">
                    <Clock className="h-3 w-3" />
                    <span title={format(log.timestamp, 'PPpp')}>
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityLog;
