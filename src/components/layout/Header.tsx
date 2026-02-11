import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, ChevronDown, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { headerMenuItems, categories, articles } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/truthlens-logo.png';

// Live Clock Component
const LiveClock = ({ className = '' }: { className?: string }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <span className={className}>
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
};

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  // Update date at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setCurrentDate(new Date());
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [currentDate]);

  const visibleMenuItems = headerMenuItems
    .filter(item => item.isVisible)
    .sort((a, b) => a.order - b.order);

  // Items explicitly marked for main nav, rest go to "More"
  const mainNavItems = visibleMenuItems.filter(item => item.showInMainNav === true);
  const moreNavItems = visibleMenuItems.filter(item => item.showInMainNav !== true);

  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar - Hidden on mobile for cleaner look */}
      <div className="border-b border-border bg-primary hidden sm:block">
        <div className="container mx-auto flex h-8 items-center justify-between px-4 text-xs text-primary-foreground">
          <span className="font-medium">Authentic Stories. Unbiased Voices.</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
            <span className="text-primary-foreground/60">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <LiveClock />
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo - Larger sizing with scroll to top */}
          <Link 
            to="/" 
            className="flex items-center"
            onClick={(e) => {
              // If already on homepage, scroll to top
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <img 
              src={logo} 
              alt="TruthLens" 
              className="h-10 w-auto sm:h-12 md:h-14 lg:h-16 object-contain" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  item.highlight 
                    ? 'font-semibold text-primary hover:text-primary/80' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </Link>
            ))}
            
            {/* More Dropdown */}
            {moreNavItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                    More
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg z-50">
                  {moreNavItems.map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link
                        to={item.path}
                        className={`w-full flex items-center gap-2 ${
                          item.highlight ? 'font-semibold text-primary' : ''
                        }`}
                      >
                        {item.icon && <span>{item.icon}</span>}
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild>
                    <Link to="/about" className="w-full">About Us</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/careers" className="w-full">Careers</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/contact" className="w-full">Contact</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="h-9 w-9"
            >
              <Search className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar with Functionality */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    // Find matching articles
                    const results = articles.filter(a => 
                      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                    if (results.length > 0) {
                      navigate(`/article/${results[0].slug}`);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }
                  }
                }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, authors..."
                  className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </form>
              
              {/* Search Results Preview */}
              {searchQuery.trim() && (
                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                  {articles
                    .filter(a => 
                      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((article) => (
                      <Link
                        key={article.id}
                        to={`/article/${article.slug}`}
                        className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }}
                      >
                        <img 
                          src={article.featuredImage} 
                          alt={article.title}
                          className="h-12 w-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{article.category.replace('-', ' ')}</p>
                        </div>
                      </Link>
                    ))}
                  
                  {/* View All Results Link */}
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-primary hover:bg-muted transition-colors border-t border-border"
                    onClick={() => {
                      setIsSearchOpen(false);
                    }}
                  >
                    <Search className="h-4 w-4" />
                    View all results for "{searchQuery}"
                  </Link>
                  
                  {articles.filter(a => 
                    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground text-center">No articles found</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu - Shows ALL items with improved styling */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-0 right-0 lg:hidden overflow-hidden z-50"
          >
            {/* Overlay backdrop */}
            <div className="absolute inset-0 bg-black/20" onClick={() => setIsMenuOpen(false)} />
            
            {/* Menu container with border and shadow */}
            <nav className="relative mx-3 my-2 flex flex-col bg-card border-2 border-border rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto">
              {/* Date & Time Header with Live Clock */}
              <div className="px-4 pt-4 pb-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <LiveClock />
                </div>
              </div>
              
              {/* Categories section */}
              <div className="px-4 pt-3 pb-2">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  Categories
                </div>
              </div>
              
              <div className="px-2">
                {visibleMenuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`block mx-2 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg flex items-center gap-2 ${
                      item.highlight 
                        ? 'text-primary font-semibold bg-primary/5 hover:bg-primary/10' 
                        : 'text-foreground hover:bg-muted hover:text-primary'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Divider */}
              <div className="mx-4 my-2 border-t border-border" />
              
              {/* More section */}
              <div className="px-4 pb-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  More
                </div>
              </div>
              
              <div className="px-2 pb-3">
                <Link
                  to="/about"
                  className="block mx-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  to="/careers"
                  className="block mx-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Careers
                </Link>
                <Link
                  to="/contact"
                  className="block mx-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
