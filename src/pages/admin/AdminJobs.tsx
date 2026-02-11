import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Save, Briefcase, Calendar, Users, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Job } from '@/types/news';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTouchSortable } from '@/hooks/useTouchSortable';
import { cn } from '@/lib/utils';
import { getJobs, saveJobs } from '@/lib/jobService';

// Draggable Job Card Component
const DraggableJobCard = ({ job, onToggleStatus, onEdit, onDelete }: {
  job: Job;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl bg-card p-4 sm:p-6 border border-border hover:shadow-lg transition-shadow touch-manipulation',
        isDragging && 'z-50 opacity-90 shadow-xl scale-[1.02]'
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            type="button"
            className={cn(
              'flex-shrink-0 p-2 rounded-md cursor-grab active:cursor-grabbing touch-manipulation mt-1',
              'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
              isDragging && 'cursor-grabbing'
            )}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-display text-lg font-semibold text-foreground">{job.title}</h3>
              <Badge variant={job.isOpen ? 'default' : 'secondary'}>
                {job.isOpen ? 'Open' : 'Closed'}
              </Badge>
              <Badge variant="outline" className="capitalize">{job.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>Department: {job.department}</span>
              <span>Deadline: {format(job.deadline, 'MMM d, yyyy')}</span>
              <span>Requirements: {job.requirements.length}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleStatus}
            title={job.isOpen ? 'Close job' : 'Open job'}
          >
            {job.isOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Drag Overlay for Jobs
const JobDragOverlay = ({ job }: { job: Job }) => (
  <div className="rounded-xl bg-card p-4 sm:p-6 border-2 border-primary shadow-2xl opacity-95">
    <div className="flex items-center gap-3">
      <GripVertical className="h-4 w-4 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground">{job.title}</h3>
          <Badge variant={job.isOpen ? 'default' : 'secondary'}>
            {job.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{job.department}</p>
      </div>
    </div>
  </div>
);

const AdminJobs = () => {
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    type: 'full-time' as Job['type'],
    description: '',
    requirements: '',
    deadline: '',
    isOpen: true
  });

  // Load jobs on mount
  useEffect(() => {
    setJobsList(getJobs());
  }, []);

  const openCreateDialog = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      department: '',
      type: 'full-time',
      description: '',
      requirements: '',
      deadline: '',
      isOpen: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      type: job.type,
      description: job.description,
      requirements: job.requirements.join('\n'),
      deadline: format(job.deadline, 'yyyy-MM-dd'),
      isOpen: job.isOpen
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requirements = formData.requirements.split('\n').filter(r => r.trim());

    let updatedList: Job[];
    if (editingJob) {
      updatedList = jobsList.map(job =>
        job.id === editingJob.id
          ? {
            ...job,
            title: formData.title,
            department: formData.department,
            type: formData.type,
            description: formData.description,
            requirements,
            deadline: new Date(formData.deadline),
            isOpen: formData.isOpen
          }
          : job
      );
      toast.success('Job updated successfully!');
    } else {
      const newJob: Job = {
        id: Date.now().toString(),
        title: formData.title,
        department: formData.department,
        type: formData.type,
        description: formData.description,
        requirements,
        deadline: new Date(formData.deadline),
        isOpen: formData.isOpen,
        createdAt: new Date()
      };
      updatedList = [newJob, ...jobsList];
      toast.success('Job created successfully!');
    }

    setJobsList(updatedList);
    saveJobs(updatedList);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      const updatedList = jobsList.filter(job => job.id !== id);
      setJobsList(updatedList);
      saveJobs(updatedList);
      toast.success('Job deleted successfully!');
    }
  };

  const toggleJobStatus = (id: string) => {
    const updatedList = jobsList.map(job =>
      job.id === id ? { ...job, isOpen: !job.isOpen } : job
    );
    setJobsList(updatedList);
    saveJobs(updatedList);
    toast.success('Job status updated!');
  };

  // Drag-and-drop for jobs reordering
  const jobsSortable = useTouchSortable({
    items: jobsList,
    getItemId: (job) => job.id,
    onReorder: (newJobs) => {
      setJobsList(newJobs);
      saveJobs(newJobs);
      toast.success('Job order updated');
    },
  });

  const getActiveJob = () => {
    if (!jobsSortable.activeId) return null;
    return jobsList.find(j => j.id === jobsSortable.activeId);
  };

  return (
    <div className="px-1 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Job Listings</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Drag jobs to reorder • Touch and hold on mobile
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{jobsList.filter(j => j.isOpen).length}</p>
              <p className="text-sm text-muted-foreground">Open Positions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{jobsList.filter(j => j.type === 'internship').length}</p>
              <p className="text-sm text-muted-foreground">Internships</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{jobsList.length}</p>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List with Drag-and-Drop */}
      <DndContext
        sensors={jobsSortable.sensors}
        collisionDetection={closestCenter}
        onDragStart={jobsSortable.handleDragStart}
        onDragEnd={jobsSortable.handleDragEnd}
        onDragCancel={jobsSortable.handleDragCancel}
      >
        <SortableContext items={jobsList.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {jobsList.map((job) => (
              <DraggableJobCard
                key={job.id}
                job={job}
                onToggleStatus={() => toggleJobStatus(job.id)}
                onEdit={() => openEditDialog(job)}
                onDelete={() => handleDelete(job.id)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {getActiveJob() && <JobDragOverlay job={getActiveJob()!} />}
        </DragOverlay>
      </DndContext>

      {jobsList.length === 0 && (
        <div className="rounded-xl bg-muted p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No jobs posted yet</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-4 sm:mx-auto">
          <DialogHeader className="flex-shrink-0 pr-8">
            <DialogTitle className="text-lg sm:text-xl">{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingJob ? 'Update job listing details.' : 'Create a new job listing.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Reporter"
                  className="text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Editorial"
                  className="text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm">Job Type *</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as Job['type'] })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm">Application Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the role"
                rows={2}
                className="text-sm resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-sm">Requirements (one per line) *</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="3+ years of experience&#10;Excellent writing skills&#10;Team player"
                rows={3}
                className="text-sm resize-none"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isOpen"
                checked={formData.isOpen}
                onCheckedChange={(checked) => setFormData({ ...formData, isOpen: checked })}
              />
              <Label htmlFor="isOpen" className="text-sm">Job is open for applications</Label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 pb-2 sticky bottom-0 bg-background">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {editingJob ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobs;
