import { useState, useEffect } from 'react';
import { getApplications, updateApplicationStatus, deleteApplication, InternshipApplication } from '@/lib/internshipService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import { Users, FileText, Mail, Phone, ExternalLink, Calendar, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminInternships = () => {
    const [applications, setApplications] = useState<InternshipApplication[]>([]);
    const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);

    useEffect(() => {
        const loadData = () => {
            setApplications(getApplications());
        };
        loadData();
        window.addEventListener('internshipApplicationsUpdated', loadData);
        return () => window.removeEventListener('internshipApplicationsUpdated', loadData);
    }, []);

    const handleStatusUpdate = (id: string, status: InternshipApplication['status']) => {
        updateApplicationStatus(id, status);
        if (selectedApp) setSelectedApp({ ...selectedApp, status });
        toast.success(`Application status marked as ${status}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this application?')) {
            deleteApplication(id);
            setSelectedApp(null);
            toast.success('Application deleted');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-500';
            case 'rejected': return 'bg-red-500';
            case 'reviewed': return 'bg-blue-500';
            default: return 'bg-yellow-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display">Internship Applications</h1>
                    <p className="text-muted-foreground">Manage incoming internship requests</p>
                </div>
                <Badge variant="secondary" className="text-sm">
                    {applications.length} Total
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No applications received yet.</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <Card
                            key={app.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow border-border"
                            onClick={() => setSelectedApp(app)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge className={`${getStatusColor(app.status)} text-white border-0 capitalize`}>
                                        {app.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(app.submittedAt, { addSuffix: true })}
                                    </span>
                                </div>
                                <CardTitle className="text-lg mt-2">{app.fullName}</CardTitle>
                                <CardDescription>{app.department} Department</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{app.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span className="truncate">{app.university}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedApp && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                        {selectedApp.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl">{selectedApp.fullName}</DialogTitle>
                                        <DialogDescription>{selectedApp.university}</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Contact Info</label>
                                        <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {selectedApp.email}</div>
                                        <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {selectedApp.phone}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Application Info</label>
                                        <div className="flex items-center gap-2"><Badge variant="outline">{selectedApp.department}</Badge></div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" /> Submitted {format(selectedApp.submittedAt, 'PP')}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Cover Letter</label>
                                    <div className="bg-muted/30 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                        {selectedApp.coverLetter}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    {selectedApp.portfolio && (
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">Portfolio</label>
                                            <a href={selectedApp.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                                <ExternalLink className="h-4 w-4" /> Open Portfolio
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Resume / CV</label>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileText className="h-4 w-4" /> {selectedApp.cvFileName}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4 flex flex-col sm:flex-row justify-between gap-4 items-center">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(selectedApp.id, 'reviewed')} disabled={selectedApp.status === 'reviewed'}>
                                            <Clock className="w-4 h-4 mr-2" /> Mark Reviewed
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusUpdate(selectedApp.id, 'accepted')} disabled={selectedApp.status === 'accepted'}>
                                            <CheckCircle className="w-4 h-4 mr-2" /> Accept
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')} disabled={selectedApp.status === 'rejected'}>
                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedApp.id)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminInternships;
