import { useState, useRef } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, key, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const AdminProfile = () => {
    const { currentUser, updateCurrentUser } = useAdminAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile Form State
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        address: currentUser?.address || '',
        phone: currentUser?.phone || '',
        bio: currentUser?.bio || '',
        avatar: currentUser?.avatar || '',
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    if (!currentUser) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            updateCurrentUser({ ...currentUser, ...formData });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsPasswordLoading(true);
        try {
            // 1. Verify Old Password (by trying to sign in)
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: currentUser.email,
                password: passwordData.oldPassword
            });

            if (signInError) {
                toast.error("Incorrect old password");
                setIsPasswordLoading(false);
                return;
            }

            // 2. Update Password
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (updateError) throw updateError;

            toast.success("Password updated successfully");
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
                    <p className="text-sm text-muted-foreground">Manage your personal information and security</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Picture & Info */}
                <Card className="md:col-span-1 border-border shadow-sm">
                    <CardContent className="flex flex-col items-center gap-6 pt-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                                <AvatarImage src={formData.avatar} alt={formData.name} className="object-cover" />
                                <AvatarFallback className="text-4xl">{formData.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                        <div className="text-center space-y-1">
                            <h3 className="font-semibold text-lg">{currentUser.name}</h3>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Badge variant="secondary" className="capitalize">{currentUser.role}</Badge>
                                <Badge variant={currentUser.isActive ? "default" : "destructive"} className="capitalize">
                                    {currentUser.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{currentUser.email}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    {/* Details Form */}
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your contact details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Age</Label>
                                        <Input value={currentUser.age || ''} disabled className="bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Input value={currentUser.gender || ''} disabled className="bg-muted" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} />
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Password Change Form */}
                    <Card className="border-red-100 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-red-500" />
                                <CardTitle>Security</CardTitle>
                            </div>
                            <CardDescription>Change your password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="oldPassword">Current Password</Label>
                                    <Input
                                        id="oldPassword"
                                        name="oldPassword"
                                        type="password"
                                        value={passwordData.oldPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" variant="destructive" disabled={isPasswordLoading}>
                                        {isPasswordLoading ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
