import { useState, useEffect } from 'react';
import { Save, Pen, MessageCircle, GraduationCap, Eye, Edit, Trash2, Plus, FileText, Download, Lock } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getArticles } from '@/lib/articleService';
import { Article } from '@/types/news';
import {
  defaultBenefits,
  defaultDepartments,
  defaultFAQs,
  defaultPageContent,
  mockApplications,
  iconMap,
  type InternshipBenefit,
  type InternshipDepartment,
  type InternshipFAQ,
  type InternshipPageContent,
  type InternshipApplication
} from '@/data/internshipData';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock data for editorial settings
const initialEditorialSettings = {
  showEditorialSection: true,
  maxEditorials: 4,
  editorialIds: ['8', '16'],
  showCommentsSection: true,
  maxComments: 4,
  moderateComments: true
};

// Mock internship settings
const initialInternshipSettings = {
  acceptingApplications: true,
  showBannerOnHomepage: true,
  requirePortfolio: false,
  autoReplyEnabled: true
};

const AdminEditorial = () => {
  const { hasPermission } = useAdminAuth();
  const [editorialSettings, setEditorialSettings] = useState(initialEditorialSettings);
  const [internshipSettings, setInternshipSettings] = useState(initialInternshipSettings);
  const [applications, setApplications] = useState<InternshipApplication[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<InternshipApplication | null>(null);

  // Load articles for selection
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  useEffect(() => {
    const loadArticles = () => setArticlesList(getArticles());
    loadArticles();

    window.addEventListener('articlesUpdated', loadArticles);
    return () => window.removeEventListener('articlesUpdated', loadArticles);
  }, []);

  const canManageEditorial = hasPermission('manageEditorial');

  // If user doesn't have permission, show restricted view
  if (!canManageEditorial) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to manage editorial and internship settings. Only administrators can access this section.
        </p>
      </div>
    );
  }

  // Internship content management
  const [benefits, setBenefits] = useState<InternshipBenefit[]>(defaultBenefits);
  const [departments, setDepartments] = useState<InternshipDepartment[]>(defaultDepartments);
  const [faqs, setFaqs] = useState<InternshipFAQ[]>(defaultFAQs);
  const [pageContent, setPageContent] = useState<InternshipPageContent>(defaultPageContent);

  // Dialog states
  const [editingBenefit, setEditingBenefit] = useState<InternshipBenefit | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<InternshipDepartment | null>(null);
  const [editingFaq, setEditingFaq] = useState<InternshipFAQ | null>(null);
  const [isBenefitDialogOpen, setIsBenefitDialogOpen] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);

  // Allow all non-rejected articles to be selected for editorial section
  const editorialArticles = articlesList.filter(a => (a.status as string) !== 'rejected');

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      reviewed: 'bg-blue-500',
      shortlisted: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const handleSaveEditorialSettings = () => {
    toast.success('Editorial settings saved successfully');
  };

  const handleSaveInternshipSettings = () => {
    toast.success('Internship settings saved successfully');
  };

  const handleSavePageContent = () => {
    // When connected to Cloud, this will update the database
    toast.success('Page content saved successfully');
  };

  const updateApplicationStatus = (id: string, status: string) => {
    setApplications(applications.map(app =>
      app.id === id ? { ...app, status: status as InternshipApplication['status'] } : app
    ));
    toast.success(`Application status updated to ${status}`);
  };

  // Benefit CRUD
  const handleSaveBenefit = (benefit: InternshipBenefit) => {
    if (editingBenefit) {
      setBenefits(benefits.map(b => b.id === benefit.id ? benefit : b));
      toast.success('Benefit updated successfully');
    } else {
      const newBenefit = { ...benefit, id: Date.now().toString(), order: benefits.length + 1 };
      setBenefits([...benefits, newBenefit]);
      toast.success('Benefit added successfully');
    }
    setIsBenefitDialogOpen(false);
    setEditingBenefit(null);
  };

  const handleDeleteBenefit = (id: string) => {
    if (confirm('Are you sure you want to delete this benefit?')) {
      setBenefits(benefits.filter(b => b.id !== id));
      toast.success('Benefit deleted successfully');
    }
  };

  // Department CRUD
  const handleSaveDepartment = (department: InternshipDepartment) => {
    if (editingDepartment) {
      setDepartments(departments.map(d => d.id === department.id ? department : d));
      toast.success('Department updated successfully');
    } else {
      const newDepartment = { ...department, id: Date.now().toString(), order: departments.length + 1 };
      setDepartments([...departments, newDepartment]);
      toast.success('Department added successfully');
    }
    setIsDepartmentDialogOpen(false);
    setEditingDepartment(null);
  };

  const handleDeleteDepartment = (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(d => d.id !== id));
      toast.success('Department deleted successfully');
    }
  };

  // FAQ CRUD
  const handleSaveFaq = (faq: InternshipFAQ) => {
    if (editingFaq) {
      setFaqs(faqs.map(f => f.id === faq.id ? faq : f));
      toast.success('FAQ updated successfully');
    } else {
      const newFaq = { ...faq, id: Date.now().toString(), order: faqs.length + 1 };
      setFaqs([...faqs, newFaq]);
      toast.success('FAQ added successfully');
    }
    setIsFaqDialogOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(f => f.id !== id));
      toast.success('FAQ deleted successfully');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Editorial & Internship Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage editorial content, comments, and internship applications
          </p>
        </div>
      </div>

      <Tabs defaultValue="editorial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="editorial" className="gap-2">
            <Pen className="h-4 w-4" />
            <span className="hidden sm:inline">Editorial</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Comments</span>
          </TabsTrigger>
          <TabsTrigger value="internship" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Internship</span>
          </TabsTrigger>
          <TabsTrigger value="internship-content" className="gap-2">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Page Content</span>
          </TabsTrigger>
        </TabsList>

        {/* Editorial Settings Tab */}
        <TabsContent value="editorial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pen className="h-5 w-5" />
                Editorial Section Settings
              </CardTitle>
              <CardDescription>
                Configure how editorials appear on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Editorial Section</Label>
                  <p className="text-sm text-muted-foreground">Display editorial section on homepage</p>
                </div>
                <Switch
                  checked={editorialSettings.showEditorialSection}
                  onCheckedChange={(checked) =>
                    setEditorialSettings({ ...editorialSettings, showEditorialSection: checked })
                  }
                />
              </div>

              <div>
                <Label>Maximum Editorials to Display</Label>
                <Input
                  type="number"
                  value={editorialSettings.maxEditorials}
                  onChange={(e) =>
                    setEditorialSettings({ ...editorialSettings, maxEditorials: parseInt(e.target.value) || 4 })
                  }
                  min={1}
                  max={10}
                  className="w-24 mt-2"
                />
              </div>

              <div>
                <Label className="mb-2 block">Featured Editorial Articles</Label>
                <div className="space-y-2">
                  {editorialArticles.map((article) => (
                    <div key={article.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <input
                        type="checkbox"
                        checked={editorialSettings.editorialIds.includes(article.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditorialSettings({
                              ...editorialSettings,
                              editorialIds: [...editorialSettings.editorialIds, article.id]
                            });
                          } else {
                            setEditorialSettings({
                              ...editorialSettings,
                              editorialIds: editorialSettings.editorialIds.filter(id => id !== article.id)
                            });
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{article.title}</p>
                        <p className="text-xs text-muted-foreground">By {article.author.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveEditorialSettings}>
                <Save className="mr-2 h-4 w-4" /> Save Editorial Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Settings Tab */}
        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments Section Settings
              </CardTitle>
              <CardDescription>
                Configure how reader comments appear on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Comments Section</Label>
                  <p className="text-sm text-muted-foreground">Display reader comments on homepage</p>
                </div>
                <Switch
                  checked={editorialSettings.showCommentsSection}
                  onCheckedChange={(checked) =>
                    setEditorialSettings({ ...editorialSettings, showCommentsSection: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Moderate Comments</Label>
                  <p className="text-sm text-muted-foreground">Require approval before publishing comments</p>
                </div>
                <Switch
                  checked={editorialSettings.moderateComments}
                  onCheckedChange={(checked) =>
                    setEditorialSettings({ ...editorialSettings, moderateComments: checked })
                  }
                />
              </div>

              <div>
                <Label>Maximum Comments to Display</Label>
                <Input
                  type="number"
                  value={editorialSettings.maxComments}
                  onChange={(e) =>
                    setEditorialSettings({ ...editorialSettings, maxComments: parseInt(e.target.value) || 4 })
                  }
                  min={1}
                  max={12}
                  className="w-24 mt-2"
                />
              </div>

              <Button onClick={handleSaveEditorialSettings}>
                <Save className="mr-2 h-4 w-4" /> Save Comments Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internship Tab */}
        <TabsContent value="internship" className="space-y-6">
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Internship Program Settings
              </CardTitle>
              <CardDescription>
                Configure internship program and application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <Label>Accepting Applications</Label>
                    <p className="text-sm text-muted-foreground">Allow new internship applications</p>
                  </div>
                  <Switch
                    checked={internshipSettings.acceptingApplications}
                    onCheckedChange={(checked) =>
                      setInternshipSettings({ ...internshipSettings, acceptingApplications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <Label>Show Banner on Homepage</Label>
                    <p className="text-sm text-muted-foreground">Display internship CTA banner</p>
                  </div>
                  <Switch
                    checked={internshipSettings.showBannerOnHomepage}
                    onCheckedChange={(checked) =>
                      setInternshipSettings({ ...internshipSettings, showBannerOnHomepage: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <Label>Require Portfolio</Label>
                    <p className="text-sm text-muted-foreground">Make portfolio URL mandatory</p>
                  </div>
                  <Switch
                    checked={internshipSettings.requirePortfolio}
                    onCheckedChange={(checked) =>
                      setInternshipSettings({ ...internshipSettings, requirePortfolio: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <Label>Auto-Reply Enabled</Label>
                    <p className="text-sm text-muted-foreground">Send confirmation emails</p>
                  </div>
                  <Switch
                    checked={internshipSettings.autoReplyEnabled}
                    onCheckedChange={(checked) =>
                      setInternshipSettings({ ...internshipSettings, autoReplyEnabled: checked })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveInternshipSettings}>
                <Save className="mr-2 h-4 w-4" /> Save Internship Settings
              </Button>
            </CardContent>
          </Card>

          {/* Applications Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Internship Applications</CardTitle>
                  <CardDescription>Review and manage internship applications</CardDescription>
                </div>
                <Badge variant="outline">{applications.length} Applications</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">{app.fullName}</h4>
                        <Badge className={`${getStatusBadge(app.status)} text-white border-0 text-xs`}>
                          {app.status}
                        </Badge>
                        {app.cvFileName && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            CV Attached
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{app.email}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{app.university}</span>
                        <span className="capitalize">{app.department}</span>
                        <span>{format(app.submittedAt, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className="space-y-4 mt-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                                  <p className="font-medium">{selectedApplication.fullName}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Email</Label>
                                  <p className="font-medium">{selectedApplication.email}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Phone</Label>
                                  <p className="font-medium">{selectedApplication.phone}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">University</Label>
                                  <p className="font-medium">{selectedApplication.university}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Department</Label>
                                  <p className="font-medium capitalize">{selectedApplication.department}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Portfolio</Label>
                                  <p className="font-medium">{selectedApplication.portfolio || 'Not provided'}</p>
                                </div>
                              </div>

                              {selectedApplication.cvFileName && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">CV/Resume</Label>
                                  <div className="flex items-center gap-2 mt-1 p-3 rounded-lg bg-muted">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <span className="flex-1 text-sm font-medium">{selectedApplication.cvFileName}</span>
                                    <Button size="sm" variant="outline">
                                      <Download className="h-4 w-4 mr-1" /> Download
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <div>
                                <Label className="text-xs text-muted-foreground">Cover Letter</Label>
                                <p className="mt-1 text-sm p-3 bg-muted rounded-lg">{selectedApplication.coverLetter}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                                >
                                  Shortlist
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewed')}
                                >
                                  Mark Reviewed
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internship Page Content Tab */}
        <TabsContent value="internship-content" className="space-y-6">
          {/* Page Content Card */}
          <Card>
            <CardHeader>
              <CardTitle>Page Content & Texts</CardTitle>
              <CardDescription>Edit the main text content of the internship page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input
                    value={pageContent.heroTitle}
                    onChange={(e) => setPageContent({ ...pageContent, heroTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle (Badge)</Label>
                  <Input
                    value={pageContent.heroSubtitle}
                    onChange={(e) => setPageContent({ ...pageContent, heroSubtitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hero Description</Label>
                <Textarea
                  value={pageContent.heroDescription}
                  onChange={(e) => setPageContent({ ...pageContent, heroDescription: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Why Join Title</Label>
                  <Input
                    value={pageContent.whyJoinTitle}
                    onChange={(e) => setPageContent({ ...pageContent, whyJoinTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departments Title</Label>
                  <Input
                    value={pageContent.departmentsTitle}
                    onChange={(e) => setPageContent({ ...pageContent, departmentsTitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Why Join Description</Label>
                <Textarea
                  value={pageContent.whyJoinDescription}
                  onChange={(e) => setPageContent({ ...pageContent, whyJoinDescription: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Form Title</Label>
                  <Input
                    value={pageContent.formTitle}
                    onChange={(e) => setPageContent({ ...pageContent, formTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>FAQ Title</Label>
                  <Input
                    value={pageContent.faqTitle}
                    onChange={(e) => setPageContent({ ...pageContent, faqTitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Form Description</Label>
                <Textarea
                  value={pageContent.formDescription}
                  onChange={(e) => setPageContent({ ...pageContent, formDescription: e.target.value })}
                  rows={2}
                />
              </div>
              <Button onClick={handleSavePageContent}>
                <Save className="mr-2 h-4 w-4" /> Save Page Content
              </Button>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Benefits</CardTitle>
                  <CardDescription>Manage internship benefits displayed on the page</CardDescription>
                </div>
                <Dialog open={isBenefitDialogOpen} onOpenChange={setIsBenefitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingBenefit(null)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Benefit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingBenefit ? 'Edit Benefit' : 'Add Benefit'}</DialogTitle>
                    </DialogHeader>
                    <BenefitForm
                      benefit={editingBenefit}
                      onSave={handleSaveBenefit}
                      onCancel={() => setIsBenefitDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {benefits.sort((a, b) => a.order - b.order).map((benefit) => (
                  <div key={benefit.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                    <Badge variant="outline" className="text-xs">{benefit.iconName}</Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{benefit.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{benefit.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingBenefit(benefit);
                          setIsBenefitDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteBenefit(benefit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Departments Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>Manage internship departments</CardDescription>
                </div>
                <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingDepartment(null)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
                    </DialogHeader>
                    <DepartmentForm
                      department={editingDepartment}
                      onSave={handleSaveDepartment}
                      onCancel={() => setIsDepartmentDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departments.sort((a, b) => a.order - b.order).map((dept) => (
                  <div key={dept.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                    <Badge variant="outline" className="text-xs">{dept.iconName}</Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{dept.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{dept.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingDepartment(dept);
                          setIsDepartmentDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteDepartment(dept.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQs Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>FAQs</CardTitle>
                  <CardDescription>Manage frequently asked questions</CardDescription>
                </div>
                <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingFaq(null)}>
                      <Plus className="h-4 w-4 mr-1" /> Add FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
                    </DialogHeader>
                    <FAQForm
                      faq={editingFaq}
                      onSave={handleSaveFaq}
                      onCancel={() => setIsFaqDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faqs.sort((a, b) => a.order - b.order).map((faq) => (
                  <div key={faq.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{faq.question}</h4>
                      <p className="text-xs text-muted-foreground truncate">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingFaq(faq);
                          setIsFaqDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Benefit Form Component
const BenefitForm = ({
  benefit,
  onSave,
  onCancel
}: {
  benefit: InternshipBenefit | null;
  onSave: (benefit: InternshipBenefit) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<InternshipBenefit>>(
    benefit || { title: '', description: '', iconName: 'BookOpen', order: 1 }
  );

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Benefit title"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Benefit description"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <Select
          value={formData.iconName}
          onValueChange={(value) => setFormData({ ...formData, iconName: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(iconMap).map((icon) => (
              <SelectItem key={icon} value={icon}>{icon}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Order</Label>
        <Input
          type="number"
          value={formData.order || 1}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
          min={1}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData as InternshipBenefit)}>Save</Button>
      </div>
    </div>
  );
};

// Department Form Component
const DepartmentForm = ({
  department,
  onSave,
  onCancel
}: {
  department: InternshipDepartment | null;
  onSave: (department: InternshipDepartment) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<InternshipDepartment>>(
    department || { name: '', description: '', iconName: 'Briefcase', order: 1 }
  );

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Department name"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Department description"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <Select
          value={formData.iconName}
          onValueChange={(value) => setFormData({ ...formData, iconName: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(iconMap).map((icon) => (
              <SelectItem key={icon} value={icon}>{icon}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Order</Label>
        <Input
          type="number"
          value={formData.order || 1}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
          min={1}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData as InternshipDepartment)}>Save</Button>
      </div>
    </div>
  );
};

// FAQ Form Component
const FAQForm = ({
  faq,
  onSave,
  onCancel
}: {
  faq: InternshipFAQ | null;
  onSave: (faq: InternshipFAQ) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<InternshipFAQ>>(
    faq || { question: '', answer: '', order: 1 }
  );

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Input
          value={formData.question || ''}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="FAQ question"
        />
      </div>
      <div className="space-y-2">
        <Label>Answer</Label>
        <Textarea
          value={formData.answer || ''}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          placeholder="FAQ answer"
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label>Order</Label>
        <Input
          type="number"
          value={formData.order || 1}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
          min={1}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData as InternshipFAQ)}>Save</Button>
      </div>
    </div>
  );
};

export default AdminEditorial;
