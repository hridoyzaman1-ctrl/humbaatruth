
export interface InternshipApplication {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    university: string;
    department: string;
    portfolio: string;
    coverLetter: string;
    cvFileName: string; // Storing just the name for mocking
    submittedAt: Date;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

const STORAGE_KEY = 'truthlens_internship_applications';

export const getApplications = (): InternshipApplication[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        return parsed.map((app: any) => ({
            ...app,
            submittedAt: new Date(app.submittedAt)
        }));
    } catch (error) {
        console.error('Error parsing internship applications', error);
        return [];
    }
};

export const saveApplication = (application: Omit<InternshipApplication, 'id' | 'submittedAt' | 'status'>): InternshipApplication => {
    const applications = getApplications();
    const newApplication: InternshipApplication = {
        ...application,
        id: Date.now().toString(),
        submittedAt: new Date(),
        status: 'pending'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newApplication, ...applications]));

    // Trigger an event so other tabs/components can update
    window.dispatchEvent(new Event('internshipApplicationsUpdated'));

    return newApplication;
};

export const updateApplicationStatus = (id: string, status: InternshipApplication['status']) => {
    const applications = getApplications();
    const updated = applications.map(app =>
        app.id === id ? { ...app, status } : app
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('internshipApplicationsUpdated'));
};

export const deleteApplication = (id: string) => {
    const applications = getApplications();
    const filtered = applications.filter(app => app.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('internshipApplicationsUpdated'));
};
