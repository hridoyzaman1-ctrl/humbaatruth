import { Layout } from '@/components/layout/Layout';

const PrivacyPage = () => {
  return (
    <Layout>
      <div className="bg-primary py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-primary-foreground">Privacy Policy</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl prose dark:prose-invert">
          <p className="text-muted-foreground">Last updated: January 2026</p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you subscribe to our 
            newsletter, contact us, or apply for a position.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, 
            send you newsletters and updates, and respond to your inquiries.
          </p>

          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to outside 
            parties except as required by law.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>Cookies</h2>
          <p>
            We use cookies to enhance your experience on our website. You can choose to disable 
            cookies through your browser settings.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at 
            privacy@truthlens.com.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
