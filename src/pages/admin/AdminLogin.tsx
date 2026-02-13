import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import truthLensLogo from '@/assets/truthlens-logo.png';
import { supabase } from '@/lib/supabase';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isAuthenticated, currentUser } = useAdminAuth();
  const { logActivity } = useActivityLog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Rate limiting - 5 attempts in 15 minutes, then 30 min lockout
  const rateLimiter = useRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    lockoutMs: 30 * 60 * 1000,
  });

  // Redirect if already authenticated AND Active
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.status === 'active') {
        navigate('/admin', { replace: true });
      } else {
        // If authenticated but not active, force logout (handled in logic below too)
        handleStatusCheck(currentUser);
      }
    }
  }, [navigate, isAuthenticated, currentUser]);

  const handleStatusCheck = async (user: any) => {
    if (user.status === 'pending') {
      await logout();
      setError('Your account is pending admin approval. Please stand by.');
    } else if (user.status === 'rejected') {
      await logout();
      setError('Your access request resulted in rejection.');
    } else if (user.status === 'suspended') {
      await logout();
      setError('Your account has been suspended.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rateLimiter.isLocked) {
      setError(`Too many failed attempts. Please try again in ${rateLimiter.formatRemainingTime()}.`);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt Login
      const result = await login(email, password, rememberMe);

      if (result.success) {
        // Success! The AdminAuthContext handles setting the currentUser 
        // and its useEffect will handle the redirect.
        toast.success('Welcome back!');
        // We don't navigate immediately here if we want to wait for the Context to settle,
        // but since we've alerted success, the useEffect in this component will trigger.
      } else {
        rateLimiter.recordAttempt(false);
        if (result.error?.includes("Email not confirmed")) {
          setError('Your email is not confirmed. Please check your inbox or contact an admin.');
        } else if (result.error?.includes("Invalid login credentials")) {
          setError('Invalid email or password.');
        } else {
          setError(result.error || 'Login failed.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <Card className="border-border shadow-xl">
          <CardHeader className="text-center space-y-4 pt-8 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 left-2 text-muted-foreground hover:text-foreground transition-colors group px-2 h-8"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs">Back</span>
            </Button>

            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <img src={truthLensLogo} alt="TruthLens" className="h-8 mx-auto mb-2" />
              <CardTitle className="text-2xl font-display">Admin Portal</CardTitle>
              <CardDescription>Sign in to access the dashboard</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">

              {rateLimiter.isLocked && (
                <Alert variant="destructive" className="border-orange-500/50 bg-orange-500/10">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-orange-600">
                    Locked. Try again in {rateLimiter.formatRemainingTime()}
                  </AlertDescription>
                </Alert>
              )}

              {error && !rateLimiter.isLocked && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    placeholder="admin@truthlens.com"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || rateLimiter.isLocked}>
                {isLoading ? 'Checking Access...' : 'Sign In'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => navigate('/admin/signup')}
                disabled={isLoading}
              >
                Request Access (Sign Up)
              </Button>

            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by TruthLens Security
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
