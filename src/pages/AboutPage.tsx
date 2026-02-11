import { Layout } from '@/components/layout/Layout';
import { Target, Eye, Users, Shield } from 'lucide-react';
import { authors } from '@/data/mockData';

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
            About TruthLens
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Authentic Stories. Unbiased Voices.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Mission & Vision */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl bg-card p-8 border border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Our Mission</h2>
            <p className="mt-4 text-muted-foreground">
              To deliver authentic, fact-based journalism that empowers readers with accurate information. 
              We are committed to uncovering the truth and presenting it without bias or agenda.
            </p>
          </div>

          <div className="rounded-xl bg-card p-8 border border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Our Vision</h2>
            <p className="mt-4 text-muted-foreground">
              To become a globally trusted source of news where readers can rely on integrity, 
              transparency, and thorough investigative journalism that makes a difference.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Our Core Values
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Integrity</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We uphold the highest standards of journalistic integrity in every story we publish.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Inclusivity</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We give voice to the unheard and tell stories that matter to all communities.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary mx-auto mb-4">
                <Eye className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Transparency</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We are open about our sources, methods, and editorial decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Our Team
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {authors.map((author) => (
              <div key={author.id} className="text-center rounded-xl bg-card p-6 border border-border">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="h-24 w-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="font-display text-lg font-semibold text-foreground">{author.name}</h3>
                <p className="text-sm text-primary capitalize">{author.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{author.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
