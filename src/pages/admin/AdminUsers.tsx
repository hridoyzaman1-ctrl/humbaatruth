import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Shield, UserCheck, UserX, User, Check, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { AdminRole, AdminUser, ROLE_DISPLAY } from '@/types/admin';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { format } from 'date-fns';

const AdminUsers = () => {
  const { hasPermission, currentUser } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  // Approval Dialog State
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('author');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load users');
    } else {
      // Map DB fields to AdminUser type
      const mapped: AdminUser[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as AdminRole,
        avatar: u.avatar,
        isActive: u.status === 'active',
        status: u.status || 'pending',
        age: u.age,
        gender: u.gender,
        createdAt: new Date(u.created_at)
      }));
      setUsers(mapped);
    }
    setIsLoading(false);
  };

  const handleApproveClick = (user: AdminUser) => {
    setSelectedUser(user);
    setSelectedRole('author'); // Default role
    setIsApproveOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('authors')
        .update({
          status: 'active',
          role: selectedRole
        })
        .eq('id', selectedUser.id);

      // Also update auth.users meta data if needed, but the table source of truth is 'authors' for our app logic
      // Ideally we sync them, but for now 'authors' drives the UI permission check.

      if (error) throw error;

      toast.success(`User approved as ${ROLE_DISPLAY[selectedRole].label}`);
      fetchUsers();
      setIsApproveOpen(false);
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to reject and remove ${user.name}? This cannot be undone.`)) return;

    try {
      // Identify user in Auth to delete them completely so they can sign up again if needed (or we keep them as rejected)
      // The prompt says: "if rejected then they wont be ablle to login and can again signup and request for access"
      // If we keep them as 'rejected', they can't signup again with same email easily unless we catch that.
      // Requirement: "can again signup and request for access".
      // So we should DELETE them from DB completely? 
      // "until acceptance cant login... wont be able to login or sign up again unless either accepted or rejected" 
      // Actually "rejected... can again signup" implies deletion is cleaner.

      // Delete from Authors (Public Profile)
      const { error: dbError } = await supabase.from('authors').delete().eq('id', user.id);
      if (dbError) throw dbError;

      // Delete from Auth Users (We need a server function or admin client for this typically).
      // RLS might block deleting from auth.users directly from client.
      // If we can't delete auth.users from here, we mark status='rejected' in authors.
      // BUT user said "can again signup". Status='rejected' prevents duplicate email signup error.
      // So we MUST delete.
      // Let's try the RPC / SQL way if we had one, but we are client side.
      // Using the `wipe` script logic? No.

      // Allow "Pseudo-Reject" = Delete 'authors' row? 
      // If we delete authors row, the Auth User still exists. They can't sign up again (Email taken).
      // So we must update Author status to 'rejected' OR we need a backend function to delete Auth User.
      // Given constraints, I'll set status = 'rejected'. 
      // The prompt says "can again signup". This implies the previous record is GONE.
      // I will implement a trick: We can't delete `auth.users` easily from client without service role.
      // **Correction**: I will set status to 'rejected'. User can't sign up with SAME email if Auth User exists.
      // User can only "request access" again if we delete.
      // I will assume for now status='rejected' blocks login (as implemented in Login).
      // Re-signup with same email requires deleting the old account.
      // **Decision**: I'll offer "Revoke/Delete" using a Server Function if available? No.
      // I will use `status = rejected`. If they want to try again, they contact admin to delete? 
      // Wait, "if rejected then they wont be ablle to login and can again signup". 
      // This is strict. ONLY way to signup again with same email is if the email is free.
      // I will rely on the Admin to "Delete" the user if they want to allow re-signup.
      // So "Reject" button -> Sets status 'rejected'. "Delete" button -> Tries to delete.

      const { error } = await supabase
        .from('authors')
        .update({ status: 'rejected' })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('User rejected');
      fetchUsers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  // Explicit Delete (Clean up bad requests)
  const handleDelete = async (id: string) => {
    if (!confirm("This will remove the user profile application. The Auth account may remain until cleaned.")) return;
    // We can only delete public.authors from here.
    await supabase.from('authors').delete().eq('id', id);
    toast.success("Application removed.");
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: AdminRole) => {
    const { error } = await supabase
      .from('authors')
      .update({ role: newRole })
      .eq('id', userId);
    if (!error) {
      toast.success("Role updated");
      fetchUsers();
    }
  };

  const activeUsers = users.filter(u => u.status === 'active');
  const pendingUsers = users.filter(u => u.status === 'pending');

  if (!hasPermission('manageUsers')) {
    return <div className="p-8 text-center text-muted-foreground">Access Denied</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-display">User Management</h1>
        <Button onClick={fetchUsers} variant="outline" size="sm">Refresh</Button>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Users ({activeUsers.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests ({pendingUsers.length})</TabsTrigger>
        </TabsList>

        {/* ACTIVE USERS */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeUsers.map(user => (
              <div key={user.id} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-10 h-10 rounded-full bg-secondary" />
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Badge className={(ROLE_DISPLAY[user.role] || ROLE_DISPLAY['user']).color}>
                    {user.role}
                  </Badge>
                </div>
                <div className="text-xs grid grid-cols-2 gap-2 mt-2 text-muted-foreground bg-muted/50 p-2 rounded">
                  <div>Age: <span className="text-foreground">{user.age || 'N/A'}</span></div>
                  <div>Gender: <span className="text-foreground">{user.gender || 'N/A'}</span></div>
                  <div>Status: <span className="text-green-600 font-medium capitalize">{user.status}</span></div>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2">
                  <Select
                    defaultValue={user.role}
                    onValueChange={(v) => handleRoleChange(user.id, v as AdminRole)}
                    disabled={user.role === 'admin' && user.email === 'hridoyzaman1@gmail.com'}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="journalist">Journalist</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    disabled={user.role === 'admin' && user.email === 'hridoyzaman1@gmail.com'}
                    onClick={() => handleDelete(user.id)}
                    title="Revoke Access"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* PENDING USERS */}
        <TabsContent value="pending">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
              No pending requests.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingUsers.map(user => (
                <div key={user.id} className="bg-card border border-l-4 border-l-orange-400 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Pending</Badge>
                  </div>

                  <div className="text-sm grid grid-cols-2 gap-2 mt-2 bg-muted/50 p-2 rounded">
                    <div><span className="text-muted-foreground text-xs">Age:</span> {user.age}</div>
                    <div><span className="text-muted-foreground text-xs">Gender:</span> {user.gender}</div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      Requested: {user.createdAt instanceof Date && !isNaN(user.createdAt.getTime())
                        ? format(user.createdAt, 'PP')
                        : 'Unknown Date'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleReject(user)}
                    >
                      <X className="h-3 w-3 mr-1" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApproveClick(user)}
                    >
                      <Check className="h-3 w-3 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Assign a role to this user. They will gain immediate access to the admin panel.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label>Assign Role</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AdminRole)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="journalist">Journalist</SelectItem>
                <SelectItem value="author">Author (Limited)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
            <Button onClick={confirmApprove}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
