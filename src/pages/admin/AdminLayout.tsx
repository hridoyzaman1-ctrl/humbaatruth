import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FolderOpen, Image, Users, Briefcase, Settings,
  Menu, X, LogOut, Star, Pen, LayoutGrid, Navigation, MessageSquare, Building,
  Shield, ChevronDown, Activity, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAdminAuth, isAdminAuthenticated } from '@/context/AdminAuthContext';
import { ROLE_DISPLAY, RolePermissions } from '@/types/admin';
import logo from '@/assets/truthlens-logo.png';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  requiredPermission?: keyof RolePermissions;
}

const allNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Star, label: 'Featured', path: '/admin/featured', requiredPermission: 'manageFeatured' },
  { icon: LayoutGrid, label: 'Sections', path: '/admin/sections', requiredPermission: 'manageSections' },
  { icon: Navigation, label: 'Header Menu', path: '/admin/menu', requiredPermission: 'manageMenu' },
  { icon: Pen, label: 'Editorial', path: '/admin/editorial', requiredPermission: 'manageEditorial' },
  { icon: FileText, label: 'Articles', path: '/admin/articles' },
  { icon: MessageSquare, label: 'Comments', path: '/admin/comments', requiredPermission: 'viewAllComments' },
  { icon: Building, label: 'Contact Info', path: '/admin/contact-info', requiredPermission: 'manageContactInfo' },
  { icon: FolderOpen, label: 'Categories', path: '/admin/categories', requiredPermission: 'manageCategories' },
  { icon: Image, label: 'Media', path: '/admin/media', requiredPermission: 'uploadMedia' },
  { icon: Users, label: 'Users', path: '/admin/users', requiredPermission: 'manageUsers' },
  { icon: Users, label: 'Team', path: '/admin/team', requiredPermission: 'manageUsers' },
  { icon: Briefcase, label: 'Jobs', path: '/admin/jobs', requiredPermission: 'manageJobs' },
  { icon: GraduationCap, label: 'Internships', path: '/admin/internships', requiredPermission: 'manageJobs' },
  { icon: Activity, label: 'Activity Log', path: '/admin/activity', requiredPermission: 'manageSettings' },
  { icon: Settings, label: 'Settings', path: '/admin/settings', requiredPermission: 'manageSettings' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, hasPermission, canAccessPath } = useAdminAuth();

  // Filter nav items based on user permissions
  const navItems = allNavItems.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  // Check authentication on mount and route changes
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { state: { from: location.pathname }, replace: true });
      return;
    }

    // Check if user can access current path
    if (currentUser && !canAccessPath(location.pathname)) {
      toast.error('You do not have permission to access this page');
      navigate('/admin', { replace: true });
    }
  }, [location.pathname, navigate, currentUser, canAccessPath]);

  // Close sidebar when route changes on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login', { replace: true });
  };

  // Don't render layout if not authenticated
  if (!isAdminAuthenticated() || !currentUser) {
    return null;
  }

  const roleInfo = ROLE_DISPLAY[currentUser.role];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="TruthLens" className="h-8" />
            <span className="font-display font-bold text-foreground">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
              <Badge className={`${roleInfo.color} text-white text-[10px] border-0`}>
                <Shield className="h-2.5 w-2.5 mr-1" />
                {roleInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64 min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-semibold text-foreground truncate lg:hidden">
            {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
          </h1>
          <div className="flex-1" />

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span>{currentUser.name}</span>
                    <Badge className={`${roleInfo.color} text-white text-[10px] border-0 w-fit`}>
                      {roleInfo.label}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">
                    View Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ThemeToggle />
        </header>
        <main className="p-4 md:p-6 overflow-x-hidden"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
