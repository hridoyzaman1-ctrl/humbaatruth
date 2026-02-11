// Shared internship data - will be managed by admin
// When connected to Cloud, this data will be stored in the database

export interface InternshipBenefit {
  id: string;
  iconName: string;
  title: string;
  description: string;
  order: number;
}

export interface InternshipDepartment {
  id: string;
  iconName: string;
  name: string;
  description: string;
  order: number;
}

export interface InternshipFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface InternshipPageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  whyJoinTitle: string;
  whyJoinDescription: string;
  departmentsTitle: string;
  formTitle: string;
  formDescription: string;
  faqTitle: string;
}

export interface InternshipApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  portfolio: string;
  coverLetter: string;
  cvFileName?: string;
  cvUrl?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  submittedAt: Date;
}

// Default benefits data
export const defaultBenefits: InternshipBenefit[] = [
  {
    id: '1',
    iconName: 'BookOpen',
    title: 'Hands-on Experience',
    description: 'Work on real stories that get published and make an impact in the world.',
    order: 1
  },
  {
    id: '2',
    iconName: 'Users',
    title: 'Mentorship Program',
    description: 'Learn directly from experienced journalists and editors in the field.',
    order: 2
  },
  {
    id: '3',
    iconName: 'Globe',
    title: 'Global Exposure',
    description: 'Cover international stories and understand global media dynamics.',
    order: 3
  },
  {
    id: '4',
    iconName: 'Award',
    title: 'Certificate & Reference',
    description: 'Receive a certificate of completion and strong professional references.',
    order: 4
  },
  {
    id: '5',
    iconName: 'TrendingUp',
    title: 'Career Growth',
    description: 'Top performers get opportunities for full-time positions.',
    order: 5
  },
  {
    id: '6',
    iconName: 'Heart',
    title: 'Meaningful Work',
    description: 'Be part of authentic journalism that uncovers untold stories.',
    order: 6
  }
];

// Default departments data
export const defaultDepartments: InternshipDepartment[] = [
  { id: '1', iconName: 'Edit3', name: 'Editorial', description: 'News writing, fact-checking, and content editing', order: 1 },
  { id: '2', iconName: 'Camera', name: 'Multimedia', description: 'Photography, videography, and visual storytelling', order: 2 },
  { id: '3', iconName: 'Mic', name: 'Podcasting', description: 'Audio production and podcast creation', order: 3 },
  { id: '4', iconName: 'Globe', name: 'Digital Media', description: 'Social media, SEO, and online engagement', order: 4 }
];

// Default FAQs
export const defaultFAQs: InternshipFAQ[] = [
  { id: '1', question: 'What is the duration of the internship?', answer: 'Our internships typically last 3-6 months, with flexibility based on your academic schedule.', order: 1 },
  { id: '2', question: 'Is this a paid internship?', answer: 'We offer stipends for our interns along with valuable experience and mentorship.', order: 2 },
  { id: '3', question: 'Can I intern remotely?', answer: 'Yes, we offer both remote and on-site internship options depending on your location and preferences.', order: 3 },
  { id: '4', question: 'What qualifications do I need?', answer: 'We welcome students and recent graduates with a passion for journalism. No prior professional experience required.', order: 4 }
];

// Default page content
export const defaultPageContent: InternshipPageContent = {
  heroTitle: 'Launch Your Journalism Career',
  heroSubtitle: 'Now Accepting Applications',
  heroDescription: 'Join TruthLens as an intern and gain real-world experience in authentic, fact-based journalism. Shape stories that matter.',
  whyJoinTitle: 'Why Intern at TruthLens?',
  whyJoinDescription: 'We believe in nurturing the next generation of journalists with meaningful experiences and genuine career opportunities.',
  departmentsTitle: 'Internship Departments',
  formTitle: 'Apply for Internship',
  formDescription: 'Fill out the form below to start your journey with TruthLens.',
  faqTitle: 'Frequently Asked Questions'
};

// Mock applications with file uploads
export const mockApplications: InternshipApplication[] = [
  {
    id: '1',
    fullName: 'Alex Johnson',
    email: 'alex.j@university.edu',
    phone: '+1 555-0123',
    university: 'Columbia University',
    department: 'editorial',
    portfolio: 'https://alexjohnson.com',
    coverLetter: 'I am passionate about investigative journalism and want to make a difference...',
    cvFileName: 'alex_johnson_cv.pdf',
    cvUrl: '#',
    status: 'pending',
    submittedAt: new Date('2026-01-12T10:00:00')
  },
  {
    id: '2',
    fullName: 'Maria Santos',
    email: 'maria.s@college.edu',
    phone: '+1 555-0456',
    university: 'NYU',
    department: 'multimedia',
    portfolio: 'https://mariasantos.portfolio.com',
    coverLetter: 'As a visual storyteller, I believe in the power of multimedia journalism...',
    cvFileName: 'maria_santos_resume.docx',
    cvUrl: '#',
    status: 'reviewed',
    submittedAt: new Date('2026-01-10T14:30:00')
  },
  {
    id: '3',
    fullName: 'David Kim',
    email: 'david.kim@school.edu',
    phone: '+1 555-0789',
    university: 'Boston University',
    department: 'digital',
    portfolio: '',
    coverLetter: 'I want to learn about digital media and social engagement strategies...',
    status: 'shortlisted',
    submittedAt: new Date('2026-01-08T09:15:00')
  }
];

// Icon mapping helper
export const iconMap: Record<string, string> = {
  BookOpen: 'BookOpen',
  Users: 'Users',
  Globe: 'Globe',
  Award: 'Award',
  TrendingUp: 'TrendingUp',
  Heart: 'Heart',
  Edit3: 'Edit3',
  Camera: 'Camera',
  Mic: 'Mic',
  Briefcase: 'Briefcase',
  GraduationCap: 'GraduationCap',
  Star: 'Star',
  Target: 'Target',
  Lightbulb: 'Lightbulb'
};
