import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Briefcase, ArrowRight, Building } from 'lucide-react';
import { getJobs } from '@/lib/jobService';
import { Job } from '@/types/news';
import { format } from 'date-fns';

const CareersPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      const data = await getJobs();
      // Only show open jobs on frontend
      setJobs(data.filter(j => j.isOpen));
    };
    loadJobs();

    // Listen for admin updates
    const handleUpdate = () => loadJobs();
    window.addEventListener('jobsUpdated', handleUpdate);
    return () => window.removeEventListener('jobsUpdated', handleUpdate);
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Join TruthLens
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Be part of a team dedicated to delivering truth and making a difference through journalism.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {jobs.length > 0 ? (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl bg-card p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h2 className="font-display text-xl font-bold text-foreground">{job.title}</h2>
                      <Badge variant="outline" className="capitalize">{job.type}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{job.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />{job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />{job.requirements.length} requirements
                      </span>
                      {job.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />Deadline: {format(new Date(job.deadline), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link to="/internship#apply">
                      <Button className="whitespace-nowrap w-full md:w-auto">
                        Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Open Positions</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We don't have any openings right now, but check back soon!
              We're always looking for talented people to join our team.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CareersPage;
