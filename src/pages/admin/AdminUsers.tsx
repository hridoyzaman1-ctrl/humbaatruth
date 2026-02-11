import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, ShieldCheck, ShieldAlert, UserCheck, UserX, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { adminUsers, rolePermissions } from '@/data/adminMockData';
import { AdminUser, UserRole } from '@/types/news';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useActivityLog } from '@/context/ActivityLogContext';

const AdminUsers = () => {
  const { hasPermission, currentUser } = useAdminAuth();
  const { logActivity } = useActivityLog();
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'author' as UserRole,
    isActive: true
  });

  const canManageUsers = hasPermission('manageUsers');

  // If user doesn't have permission, show restricted view
  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to manage users. Only administrators can access this section.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-500 text-white',
      editor: 'bg-purple-500 text-white',
      journalist: 'bg-blue-500 text-white',
      author: 'bg-green-500 text-white',
      reporter: 'bg-amber-500 text-white'
    };
    return colors[role] || 'bg-gray-500 text-white';
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="h-4 w-4" />;
      case 'editor':
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, permissions: rolePermissions[formData.role] || [] }
          : u
      ));
      logActivity('update', 'user', {
        resourceId: editingUser.id,
        resourceName: formData.name,
        details: `Updated user role to ${formData.role}`
      });
      toast.success('User updated successfully');
    } else {
      const newUser: AdminUser = {
        id: `admin-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        role: formData.role,
        isActive: formData.isActive,
        permissions: rolePermissions[formData.role] || [],
        createdAt: new Date()
      };
      setUsers([...users, newUser]);
      logActivity('create', 'user', {
        resourceId: newUser.id,
        resourceName: formData.name,
        details: `Created new ${formData.role} user`
      });
      toast.success('User created successfully');
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(users.filter(u => u.id !== id));
    logActivity('delete', 'user', {
      resourceId: id,
      resourceName: user?.name,
      details: 'Removed user from system'
    });
    toast.success('User removed successfully');
  };

  const toggleUserStatus = (id: string) => {
    const user = users.find(u => u.id === id);
    const newStatus = !user?.isActive;
    setUsers(users.map(u => 
      u.id === id ? { ...u, isActive: newStatus } : u
    ));
    logActivity('toggle', 'user', {
      resourceId: id,
      resourceName: user?.name,
      details: newStatus ? 'Activated user account' : 'Deactivated user account'
    });
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'author', isActive: true });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">User Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="journalist">Journalist</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="reporter">Reporter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active Status</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <Label className="text-xs text-muted-foreground">Permissions for {formData.role}</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(rolePermissions[formData.role] || []).map((perm) => (
                    <Badge key={perm} variant="outline" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSaveUser}>
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="journalist">Journalist</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="reporter">Reporter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="rounded-xl bg-card p-4 border border-border">
            <div className="flex items-start gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                  {user.isActive ? (
                    <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <UserX className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${getRoleBadge(user.role)} border-0 text-xs`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Joined: {format(user.createdAt, 'MMM d, yyyy')}</span>
                {user.lastLogin && (
                  <span>Last: {format(user.lastLogin, 'MMM d')}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditUser(user)}
                >
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleUserStatus(user.id)}
                >
                  {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.role === 'admin'}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No users found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
