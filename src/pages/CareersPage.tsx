import { Layout } from '@/components/layout/Layout';
import { jobs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Briefcase, Building, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const CareersPage = () => {
  const openJobs = jobs.filter(j => j.isOpen);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Join Our Team
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Be part of a team dedicated to authentic journalism and making a difference.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Culture */}
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">Why TruthLens?</h2>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
            At TruthLens, we believe in the power of journalism to create change. We offer a dynamic 
            work environment where creativity, integrity, and collaboration are valued. Join us in 
            our mission to deliver authentic stories that matter.
          </p>
        </div>

        {/* Job Listings */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 border-b-2 border-primary pb-2">
            Current Openings
          </h2>
          
          {openJobs.length > 0 ? (
            <div className="space-y-4">
              {openJobs.map((job) => (
                <div key={job.id} className="rounded-xl bg-card p-6 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-xl font-semibold text-foreground">
                          {job.title}
                        </h3>
                        <Badge variant={job.type === 'internship' ? 'secondary' : 'default'}>
                          {job.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{job.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Deadline: {format(job.deadline, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <Link to={`/careers/${job.id}`}>
                      <Button className="whitespace-nowrap">
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-xl bg-muted">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No open positions at the moment. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Other Opportunities */}
        <div className="grid gap-6 md:grid-cols-2 mt-12">
          <div className="rounded-xl bg-card p-6 border border-border">
            <h3 className="font-display text-lg font-semibold text-foreground">Internship Program</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our internship program offers hands-on experience in journalism, digital media, and editorial operations.
            </p>
          </div>
          <div className="rounded-xl bg-card p-6 border border-border">
            <h3 className="font-display text-lg font-semibold text-foreground">Freelance Contributors</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We're always looking for talented freelance writers and contributors. Submit your work samples.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CareersPage;
