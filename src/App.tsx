import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { ActivityLogProvider } from "@/context/ActivityLogContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ArticlePage from "./pages/ArticlePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CareersPage from "./pages/CareersPage";
import InternshipPage from "./pages/InternshipPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SearchPage from "./pages/SearchPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFeatured from "./pages/admin/AdminFeatured";
import AdminEditorial from "./pages/admin/AdminEditorial";
import AdminSections from "./pages/admin/AdminSections";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminComments from "./pages/admin/AdminComments";
import AdminContactInfo from "./pages/admin/AdminContactInfo";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminInternships from "./pages/admin/AdminInternships";
import TeamPage from "./pages/TeamPage";
import AdminTeam from "./pages/admin/AdminTeam";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AdminAuthProvider>
        <ActivityLogProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/internship" element={<InternshipPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="featured" element={<AdminFeatured />} />
                  <Route path="sections" element={<AdminSections />} />
                  <Route path="menu" element={<AdminMenu />} />
                  <Route path="editorial" element={<AdminEditorial />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="comments" element={<AdminComments />} />
                  <Route path="contact-info" element={<AdminContactInfo />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="team" element={<AdminTeam />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="internships" element={<AdminInternships />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="activity" element={<AdminActivityLog />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ActivityLogProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
