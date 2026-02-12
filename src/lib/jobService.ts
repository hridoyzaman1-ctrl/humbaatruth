import { supabase } from './supabase';
import { Job } from '@/types/news';

// Map a raw Supabase row to a Job object
const mapJob = (row: any): Job => ({
    id: row.id,
    title: row.title || '',
    department: row.department || '',
    type: row.type || 'full-time',
    description: row.description || '',
    requirements: row.requirements || [],
    deadline: new Date(row.deadline || Date.now()),
    isOpen: row.is_open ?? true,
    createdAt: new Date(row.created_at || Date.now())
});

export const getJobs = async (): Promise<Job[]> => {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
    return (data || []).map(mapJob);
};

export const saveJobs = async (jobs: Job[]) => {
    // Bulk upsert — used for reordering etc.
    for (const job of jobs) {
        await supabase.from('jobs').upsert({
            id: job.id,
            title: job.title,
            department: job.department,
            type: job.type,
            description: job.description,
            requirements: job.requirements,
            deadline: job.deadline.toISOString(),
            is_open: job.isOpen,
            created_at: job.createdAt.toISOString()
        });
    }
    window.dispatchEvent(new Event('jobsUpdated'));
};

export const addJob = async (job: Omit<Job, 'id' | 'createdAt'>): Promise<Job | null> => {
    const { data, error } = await supabase
        .from('jobs')
        .insert({
            title: job.title,
            department: job.department,
            type: job.type,
            description: job.description,
            requirements: job.requirements,
            deadline: job.deadline.toISOString(),
            is_open: job.isOpen
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding job:', error);
        throw error;
    }
    window.dispatchEvent(new Event('jobsUpdated'));
    return mapJob(data);
};

export const updateJob = async (id: string, updates: Partial<Job>): Promise<void> => {
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.requirements !== undefined) payload.requirements = updates.requirements;
    if (updates.deadline !== undefined) payload.deadline = updates.deadline.toISOString();
    if (updates.isOpen !== undefined) payload.is_open = updates.isOpen;

    const { error } = await supabase
        .from('jobs')
        .update(payload)
        .eq('id', id);

    if (error) {
        console.error('Error updating job:', error);
        throw error;
    }
    window.dispatchEvent(new Event('jobsUpdated'));
};

export const deleteJob = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting job:', error);
        throw error;
    }
    window.dispatchEvent(new Event('jobsUpdated'));
};
