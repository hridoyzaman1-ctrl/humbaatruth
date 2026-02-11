// Site contact information - managed through admin panel
// When Cloud is connected, this will be stored in the database

export interface ContactInfo {
  id: string;
  type: 'email' | 'phone' | 'address';
  label: string;
  value: string;
  isVisible: boolean;
  order: number;
  showInFooter: boolean;
  showOnContactPage: boolean;
}

export interface AboutInfo {
  id: string;
  section: 'mission' | 'vision' | 'value' | 'general';
  title: string;
  content: string;
  icon?: string;
  isVisible: boolean;
  order: number;
}

// Default contact information
export const contactInfoData: ContactInfo[] = [
  {
    id: '1',
    type: 'email',
    label: 'General Inquiries',
    value: 'contact@truthlens.com',
    isVisible: true,
    order: 1,
    showInFooter: true,
    showOnContactPage: true,
  },
  {
    id: '2',
    type: 'email',
    label: 'Press & Media',
    value: 'press@truthlens.com',
    isVisible: true,
    order: 2,
    showInFooter: false,
    showOnContactPage: true,
  },
  {
    id: '3',
    type: 'email',
    label: 'Careers',
    value: 'careers@truthlens.com',
    isVisible: true,
    order: 3,
    showInFooter: false,
    showOnContactPage: true,
  },
  {
    id: '4',
    type: 'phone',
    label: 'Main Office',
    value: '+1 (555) 123-4567',
    isVisible: true,
    order: 4,
    showInFooter: false,
    showOnContactPage: true,
  },
  {
    id: '5',
    type: 'phone',
    label: 'News Tips Hotline',
    value: '+1 (555) 987-6543',
    isVisible: true,
    order: 5,
    showInFooter: false,
    showOnContactPage: true,
  },
  {
    id: '6',
    type: 'address',
    label: 'Headquarters',
    value: '123 News Street\nMedia City, MC 12345\nUnited States',
    isVisible: true,
    order: 6,
    showInFooter: false,
    showOnContactPage: true,
  },
];

export const aboutInfoData: AboutInfo[] = [
  {
    id: '1',
    section: 'mission',
    title: 'Our Mission',
    content: 'To deliver authentic, fact-based journalism that empowers readers with accurate information. We are committed to uncovering the truth and presenting it without bias or agenda.',
    icon: 'Target',
    isVisible: true,
    order: 1,
  },
  {
    id: '2',
    section: 'vision',
    title: 'Our Vision',
    content: 'To become a globally trusted source of news where readers can rely on integrity, transparency, and thorough investigative journalism that makes a difference.',
    icon: 'Eye',
    isVisible: true,
    order: 2,
  },
  {
    id: '3',
    section: 'value',
    title: 'Integrity',
    content: 'We uphold the highest standards of journalistic integrity in every story we publish.',
    icon: 'Shield',
    isVisible: true,
    order: 3,
  },
  {
    id: '4',
    section: 'value',
    title: 'Inclusivity',
    content: 'We give voice to the unheard and tell stories that matter to all communities.',
    icon: 'Users',
    isVisible: true,
    order: 4,
  },
  {
    id: '5',
    section: 'value',
    title: 'Transparency',
    content: 'We are open about our sources, methods, and editorial decisions.',
    icon: 'Eye',
    isVisible: true,
    order: 5,
  },
];

// Helper functions to get filtered data
export const getFooterContacts = () => 
  contactInfoData.filter(c => c.isVisible && c.showInFooter).sort((a, b) => a.order - b.order);

export const getContactPageContacts = () => 
  contactInfoData.filter(c => c.isVisible && c.showOnContactPage).sort((a, b) => a.order - b.order);

export const getAboutInfoBySection = (section: AboutInfo['section']) =>
  aboutInfoData.filter(a => a.isVisible && a.section === section).sort((a, b) => a.order - b.order);
