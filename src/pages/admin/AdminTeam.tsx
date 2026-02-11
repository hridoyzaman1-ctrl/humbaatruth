import { useState, useEffect } from 'react';
import { getTeamMembers, saveTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/teamService';
import { TeamMember } from '@/types/team';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical, Image as ImageIcon, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTouchSortable } from '@/hooks/useTouchSortable';

const SortableTeamMember = ({ member, onEdit, onDelete }: { member: TeamMember; onEdit: (m: TeamMember) => void; onDelete: (id: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg mb-3 shadow-sm group">
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-5 w-5" />
            </div>
            <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 bg-muted">
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{member.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(member)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(member.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const AdminTeam = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState<Partial<TeamMember>>({
        name: '',
        role: '',
        image: '',
        bio: '',
        email: '',
        twitter: '',
        linkedin: ''
    });

    useEffect(() => {
        loadMembers();
        window.addEventListener('teamMembersUpdated', loadMembers);
        return () => window.removeEventListener('teamMembersUpdated', loadMembers);
    }, []);

    const loadMembers = () => {
        setMembers(getTeamMembers().sort((a, b) => a.order - b.order));
    };

    const sortable = useTouchSortable({
        items: members.map(m => m.id),
        getItemId: (id) => id,
        onReorder: (newIds) => {
            const reordered = newIds.map((id, index) => {
                const member = members.find(m => m.id === id);
                return member ? { ...member, order: index + 1 } : null;
            }).filter(Boolean) as TeamMember[];
            saveTeamMembers(reordered);
            toast.success('Team order updated');
        }
    });

    const handleOpenDialog = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setFormData(member);
        } else {
            setEditingMember(null);
            setFormData({
                name: '',
                role: '',
                image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60',
                bio: '',
                email: '',
                twitter: '',
                linkedin: ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.role) return;

        if (editingMember) {
            updateTeamMember({ ...editingMember, ...formData } as TeamMember);
            toast.success('Team member updated');
        } else {
            addTeamMember({
                ...formData as any,
                order: members.length + 1
            });
            toast.success('Team member added');
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this team member?')) {
            deleteTeamMember(id);
            toast.success('Team member deleted');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold">Team Management</h1>
                    <p className="text-muted-foreground">Manage employees and team members</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <DndContext
                        sensors={sortable.sensors}
                        collisionDetection={closestCenter}
                        onDragStart={sortable.handleDragStart}
                        onDragEnd={sortable.handleDragEnd}
                        onDragCancel={sortable.handleDragCancel}
                    >
                        <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            {members.map(member => (
                                <SortableTeamMember
                                    key={member.id}
                                    member={member}
                                    onEdit={handleOpenDialog}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </SortableContext>
                        <DragOverlay>
                            {sortable.activeId ? (
                                <div className="p-4 bg-card border border-primary/50 shadow-xl rounded-lg opacity-90">
                                    Drag Item
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>

                <div>
                    {/* Quick Tips or Stats could go here */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Team Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{members.length}</div>
                            <p className="text-sm text-muted-foreground">Active Members</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingMember ? 'Edit Member' : 'Add Team Member'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-muted overflow-hidden shrink-0 border relative group cursor-pointer">
                                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon className="h-8 w-8 m-auto mt-6 text-muted-foreground" />}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs">Change</span>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label>Full Name *</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. John Doe" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Role / Job Title *</Label>
                            <Input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Senior Editor" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Short biography..." rows={3} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@company.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Twitter URL</Label>
                                <Input value={formData.twitter} onChange={e => setFormData({ ...formData, twitter: e.target.value })} placeholder="https://twitter.com/..." />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>LinkedIn URL</Label>
                                <Input value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            <Save className="h-4 w-4 mr-2" /> Save Member
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminTeam;
