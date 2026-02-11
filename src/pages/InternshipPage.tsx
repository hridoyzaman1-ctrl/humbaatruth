import { useState, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Users,
  Award,
  Briefcase,
  Globe,
  Heart,
  CheckCircle,
  BookOpen,
  Mic,
  Camera,
  Edit3,
  TrendingUp,
  Upload,
  FileText,
  X,
  Star,
  Target,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import {
  defaultBenefits,
  defaultDepartments,
  defaultFAQs,
  defaultPageContent,
  type InternshipBenefit,
  type InternshipDepartment,
  type InternshipFAQ,
  type InternshipPageContent
} from '@/data/internshipData';
import { saveApplication } from '@/lib/internshipService';

// Icon component mapper
const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    BookOpen,
    Users,
    Globe,
    Award,
    TrendingUp,
    Heart,
    Edit3,
    Camera,
    Mic,
    Briefcase,
    GraduationCap,
    Star,
    Target,
    Lightbulb
  };

  const Icon = icons[iconName] || BookOpen;
  return <Icon className={className} />;
};

// Accepted file types
const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const InternshipPage = () => {
  // In production, these would come from the database via Cloud
  const [benefits] = useState<InternshipBenefit[]>(defaultBenefits);
  const [departments] = useState<InternshipDepartment[]>(defaultDepartments);
  const [faqs] = useState<InternshipFAQ[]>(defaultFAQs);
  const [pageContent] = useState<InternshipPageContent>(defaultPageContent);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    department: '',
    portfolio: '',
    coverLetter: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, DOCX, JPG, or PNG file');
        return;
      }

      setCvFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const removeFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      saveApplication({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        department: formData.department,
        portfolio: formData.portfolio,
        coverLetter: formData.coverLetter,
        cvFileName: cvFile ? cvFile.name : 'unknown.pdf'
      });

      toast.success('Application submitted successfully! We will contact you soon.');

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        university: '',
        department: '',
        portfolio: '',
        coverLetter: ''
      });
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">{pageContent.heroSubtitle}</Badge>
          <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
            {pageContent.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            {pageContent.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-medium">3-6 Month Programs</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-primary-foreground">
              <Briefcase className="h-5 w-5" />
              <span className="text-sm font-medium">Remote & On-site Options</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-display text-2xl font-bold text-foreground md:text-3xl mb-4">
            {pageContent.whyJoinTitle}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {pageContent.whyJoinDescription}
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.sort((a, b) => a.order - b.order).map((benefit) => (
              <Card key={benefit.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <IconComponent iconName={benefit.iconName} className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-display text-2xl font-bold text-foreground md:text-3xl mb-12">
            {pageContent.departmentsTitle}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {departments.sort((a, b) => a.order - b.order).map((dept) => (
              <div key={dept.id} className="text-center p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <IconComponent iconName={dept.iconName} className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{dept.name}</h3>
                <p className="text-sm text-muted-foreground">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 bg-muted/30" id="apply">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-center font-display text-2xl font-bold text-foreground md:text-3xl mb-4">
              {pageContent.formTitle}
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              {pageContent.formDescription}
            </p>

            <Card className="bg-card border-border">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your phone number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">University/Institution *</Label>
                      <Input
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        placeholder="Your university name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Preferred Department *</Label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name.toLowerCase()}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CV/Resume Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="cv">Upload CV/Resume *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>

                    {!cvFile ? (
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <input
                          ref={fileInputRef}
                          id="cv"
                          type="file"
                          accept={ACCEPTED_FILE_TYPES}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{cvFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeFile}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio/LinkedIn URL (Optional)</Label>
                    <Input
                      id="portfolio"
                      name="portfolio"
                      type="url"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://your-portfolio.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Why do you want to intern at TruthLens? *</Label>
                    <Textarea
                      id="coverLetter"
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself and why you're interested in journalism..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || !cvFile}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </Button>

                  {!cvFile && (
                    <p className="text-xs text-center text-muted-foreground">
                      Please upload your CV/Resume to submit the application
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-display text-2xl font-bold text-foreground md:text-3xl mb-12">
            {pageContent.faqTitle}
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.sort((a, b) => a.order - b.order).map((faq) => (
              <div key={faq.id} className="rounded-xl bg-card border border-border p-6">
                <h3 className="font-display font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default InternshipPage;
