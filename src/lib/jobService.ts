import { Job } from '@/types/news';
import { jobs as initialJobs } from '@/data/mockData';

const JOBS_KEY = 'truthlens_jobs';

export const getJobs = (): Job[] => {
    const data = localStorage.getItem(JOBS_KEY);
    if (!data) return initialJobs;
    try {
        const parsed = JSON.parse(data);
        // Convert date strings back to Date objects
        return parsed.map((job: any) => ({
            ...job,
            deadline: new Date(job.deadline),
            createdAt: new Date(job.createdAt)
        }));
    } catch (error) {
        console.error('Error parsing jobs', error);
        return initialJobs;
    }
};

export const saveJobs = (jobs: Job[]) => {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    window.dispatchEvent(new Event('jobsUpdated'));
};

export const addJob = (job: Job) => {
    const jobs = getJobs();
    const updatedJobs = [job, ...jobs];
    saveJobs(updatedJobs);
    return updatedJobs;
};

export const updateJob = (id: string, updates: Partial<Job>) => {
    const jobs = getJobs();
    const updatedJobs = jobs.map(job =>
        job.id === id ? { ...job, ...updates } : job
    );
    saveJobs(updatedJobs);
    return updatedJobs;
};

export const deleteJob = (id: string) => {
    const jobs = getJobs();
    const updatedJobs = jobs.filter(job => job.id !== id);
    saveJobs(updatedJobs);
    return updatedJobs;
};
