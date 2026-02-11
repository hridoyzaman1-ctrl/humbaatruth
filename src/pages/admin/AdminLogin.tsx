import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { ROLE_DISPLAY } from '@/types/admin';
import truthLensLogo from '@/assets/truthlens-logo.png';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

// For backward compatibility
export const isAdminAuthenticated = (): boolean => {
  const storedUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
  return !!storedUser;
};

export const adminLogout = (): void => {
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminUser');
  localStorage.removeItem('adminAuth');
  sessionStorage.removeItem('adminAuth');
};

type ViewMode = 'login' | 'reset' | 'reset-sent';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAdminAuth();
  const { logActivity } = useActivityLog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  // Rate limiting - 5 attempts in 15 minutes, then 30 min lockout
  const rateLimiter = useRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    lockoutMs: 30 * 60 * 1000,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [navigate, isAuthenticated]);

  const validateForm = () => {
    try {
      if (viewMode === 'reset') {
        resetSchema.parse({ email });
      } else {
        loginSchema.parse({ email, password });
      }
      setValidationErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: { email?: string; password?: string } = {};
        err.errors.forEach((e) => {
          if (e.path[0] === 'email') errors.email = e.message;
          if (e.path[0] === 'password') errors.password = e.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limiting
    if (rateLimiter.isLocked) {
      setError(`Too many failed attempts. Please try again in ${rateLimiter.formatRemainingTime()}.`);
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Attempt login
    const success = login(email, password, rememberMe);

    if (success) {
      rateLimiter.recordAttempt(true);
      // Log activity after successful login
      setTimeout(() => {
        logActivity('login', 'session', {
          details: `Logged in from ${navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'} device`
        });
      }, 100);
      toast.success('Welcome back!');

      // Redirect to intended page or admin dashboard
      const from = (location.state as { from?: string })?.from || '/admin';
      navigate(from, { replace: true });
    } else {
      rateLimiter.recordAttempt(false);

      if (rateLimiter.attemptsRemaining <= 1) {
        setError(`Invalid credentials. ${rateLimiter.attemptsRemaining} attempt${rateLimiter.attemptsRemaining === 1 ? '' : 's'} remaining before lockout.`);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For security, always show success message
    setViewMode('reset-sent');
    toast.success('If an account exists, a reset link has been sent.');

    setIsLoading(false);
  };

  const switchToReset = () => {
    setViewMode('reset');
    setError('');
    setValidationErrors({});
  };

  const switchToLogin = () => {
    setViewMode('login');
    setError('');
    setValidationErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <img
                src={truthLensLogo}
                alt="TruthLens"
                className="h-8 mx-auto mb-2"
              />
              <CardTitle className="text-2xl font-display">
                {viewMode === 'login' && 'Admin Portal'}
                {viewMode === 'reset' && 'Reset Password'}
                {viewMode === 'reset-sent' && 'Check Your Email'}
              </CardTitle>
              <CardDescription>
                {viewMode === 'login' && 'Sign in to access the admin dashboard'}
                {viewMode === 'reset' && 'Enter your email to receive a reset link'}
                {viewMode === 'reset-sent' && 'We\'ve sent you password reset instructions'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {/* Login Form */}
              {viewMode === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {/* Demo Credentials Info */}
                  <Alert className="border-blue-500/50 bg-blue-500/10">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-xs">
                      <p className="font-semibold mb-1">Demo Accounts:</p>
                      <div className="space-y-0.5 text-muted-foreground">
                        <p><span className="font-mono">admin@truthlens.com</span> / admin123</p>
                        <p><span className="font-mono">editor@truthlens.com</span> / editor123</p>
                        <p><span className="font-mono">author@truthlens.com</span> / author123</p>
                        <p><span className="font-mono">journalist@truthlens.com</span> / journalist123</p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {rateLimiter.isLocked && (
                    <Alert variant="destructive" className="border-orange-500/50 bg-orange-500/10">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <AlertDescription className="text-orange-600">
                        Account temporarily locked due to too many failed attempts.
                        <br />
                        <span className="font-mono font-bold">{rateLimiter.formatRemainingTime()}</span> remaining
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setValidationErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        placeholder="admin@truthlens.com"
                        className={`pl-10 ${validationErrors.email ? 'border-destructive' : ''}`}
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-xs text-destructive">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={switchToReset}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setValidationErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
                        autoComplete="current-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-xs text-destructive">{validationErrors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me for 7 days
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading || rateLimiter.isLocked}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Signing in...
                      </span>
                    ) : rateLimiter.isLocked ? (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Locked ({rateLimiter.formatRemainingTime()})
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.form>
              )}

              {/* Password Reset Form */}
              {viewMode === 'reset' && (
                <motion.form
                  key="reset"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handlePasswordReset}
                  className="space-y-4"
                >
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setValidationErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        placeholder="admin@truthlens.com"
                        className={`pl-10 ${validationErrors.email ? 'border-destructive' : ''}`}
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-xs text-destructive">{validationErrors.email}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={switchToLogin}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </motion.form>
              )}

              {/* Reset Email Sent */}
              {viewMode === 'reset-sent' && (
                <motion.div
                  key="reset-sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="text-center space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      If an account exists for <span className="font-medium text-foreground">{email}</span>,
                      you will receive password reset instructions shortly.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Check your spam folder if you don't see the email.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={switchToLogin}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by TruthLens Security •
          <a href="/privacy" className="hover:underline ml-1">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
