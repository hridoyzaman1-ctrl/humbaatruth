import { Layout } from '@/components/layout/Layout';

const TermsPage = () => {
  return (
    <Layout>
      <div className="bg-primary py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-primary-foreground">Terms of Use</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl prose dark:prose-invert">
          <p className="text-muted-foreground">Last updated: January 2026</p>
          
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using the TruthLens website, you accept and agree to be bound by 
            these Terms of Use.
          </p>

          <h2>Use of Content</h2>
          <p>
            All content on this website is protected by copyright. You may not reproduce, 
            distribute, or create derivative works without our express permission.
          </p>

          <h2>User Conduct</h2>
          <p>
            You agree not to use the website for any unlawful purpose or in any way that could 
            damage, disable, or impair the website.
          </p>

          <h2>Comments and Submissions</h2>
          <p>
            You are responsible for any comments or content you submit. We reserve the right 
            to remove any content that violates these terms.
          </p>

          <h2>Disclaimer</h2>
          <p>
            The information provided on this website is for general informational purposes only. 
            We make no warranties about the completeness, reliability, or accuracy of this information.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the 
            website constitutes acceptance of any changes.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms of Use, please contact us at 
            legal@truthlens.com.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
