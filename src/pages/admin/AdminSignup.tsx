import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, Calendar, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const AdminSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Check if user already exists in authors table (even if not in auth yet)
            // This prevents duplicate requests from being submitted if someone clears cookies but same email.
            const { data: existingUser } = await supabase
                .from('authors')
                .select('status')
                .eq('email', formData.email.toLowerCase())
                .maybeSingle();

            if (existingUser) {
                if (existingUser.status === 'pending') {
                    throw new Error('You already have a pending request. Please wait for admin approval.');
                }
                if (existingUser.status === 'active') {
                    throw new Error('This account is already active. Please go to login.');
                }
                // If status is 'rejected', we allow them to proceed (they will be overwritten or purged)
            }

            // 2. Sign Up with Meta Data
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        age: parseInt(formData.age),
                        gender: formData.gender,
                        role: 'author', // Default role
                        status: 'pending'
                    }
                }
            });

            if (signUpError) {
                // Handle the case where Auth record exists but profile doesn't (rare sync issue)
                if (signUpError.message.includes('already registered')) {
                    throw new Error('This email is already registered. If you forgot your password or were rejected, please contact support.');
                }
                throw signUpError;
            }

            setIsSuccess(true);
            toast.success('Request Submitted Successfully');
        } catch (error: any) {
            console.error('Signup error:', error);
            toast.error(error.message || 'Failed to sign up');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
                <Card className="w-full max-w-md text-center p-6 border-border shadow-xl">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Access Requested</h2>
                    <p className="text-muted-foreground mb-6">
                        Your account has been created and is pending approval.
                        <br />
                        Please stand by. You will be able to login once an administrator reviews your request.
                    </p>
                    <Button onClick={() => navigate('/admin/login')} className="w-full">
                        Return to Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="border-border shadow-xl">
                    <CardHeader className="text-center relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 left-2"
                            onClick={() => navigate('/admin/login')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Request Admin Access</CardTitle>
                        <CardDescription>
                            Submit your details for review.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="John Doe"
                                        className="pl-9"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Age */}
                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="25"
                                            className="pl-9"
                                            value={formData.age}
                                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                                            required
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select onValueChange={v => setFormData({ ...formData, gender: v })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="email@example.com"
                                        className="pl-9"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-9 pr-9"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? 'Submitting...' : 'Submit Request'}
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default AdminSignup;
