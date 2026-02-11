import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, MessageCircle, Send, Mail, Share2, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socialMediaLinks, siteSettings } from '@/data/mockData';
import { contactInfoData } from '@/data/siteContactData';
import logo from '@/assets/truthlens-logo.png';

export const Footer = () => {
  const visibleSocialLinks = socialMediaLinks.filter(link => link.isVisible && link.url);
  const footerContacts = contactInfoData.filter(c => c.isVisible && c.showInFooter).sort((a, b) => a.order - b.order);

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />;
      case 'phone': return <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />;
      case 'address': return <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />;
      default: return <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />;
    }
  };

  const getSocialIcon = (platform: string) => {
    const iconProps = { className: "h-5 w-5" };
    switch (platform) {
      case 'facebook': return <Facebook {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      case 'instagram': return <Instagram {...iconProps} />;
      case 'youtube': return <Youtube {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'tiktok': return <span className="text-base">📱</span>;
      case 'whatsapp': return <MessageCircle {...iconProps} />;
      case 'telegram': return <Send {...iconProps} />;
      default: return <Share2 {...iconProps} />;
    }
  };

  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      facebook: 'Facebook',
      twitter: 'X (Twitter)',
      instagram: 'Instagram',
      youtube: 'YouTube',
      linkedin: 'LinkedIn',
      tiktok: 'TikTok',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
    };
    return names[platform] || platform;
  };

  return (
    <footer className="border-t border-border bg-card">
      {/* Newsletter Section */}
      <div className="bg-primary py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
            Stay Informed
          </h3>
          <p className="mt-2 text-primary-foreground/80">
            Subscribe to our newsletter for the latest stories delivered to your inbox.
          </p>
          <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border-0 bg-primary-foreground px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center">
              <img src={logo} alt={siteSettings.siteName} className="h-10 w-auto object-contain" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {siteSettings.tagline} {siteSettings.siteDescription}
            </p>
            {visibleSocialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {visibleSocialLinks.map((link) => (
                  <a 
                    key={link.id}
                    href={link.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                    title={getPlatformName(link.platform)}
                    aria-label={`Follow us on ${getPlatformName(link.platform)}`}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">Categories</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/category/national" className="text-sm text-muted-foreground hover:text-foreground">National</Link></li>
              <li><Link to="/category/international" className="text-sm text-muted-foreground hover:text-foreground">International</Link></li>
              <li><Link to="/category/economy" className="text-sm text-muted-foreground hover:text-foreground">Economy</Link></li>
              <li><Link to="/category/sports" className="text-sm text-muted-foreground hover:text-foreground">Sports</Link></li>
              <li><Link to="/category/technology" className="text-sm text-muted-foreground hover:text-foreground">Technology</Link></li>
              <li><Link to="/category/untold-stories" className="text-sm font-medium text-accent hover:text-accent/80">Untold Stories</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">Company</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Use</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">Connect With Us</h4>
            <ul className="mt-4 space-y-3">
              {footerContacts.length > 0 ? (
                footerContacts.map((contact) => (
                  <li key={contact.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                    {getContactIcon(contact.type)}
                    {contact.type === 'email' ? (
                      <a href={`mailto:${contact.value}`} className="hover:text-foreground transition-colors">
                        {contact.value}
                      </a>
                    ) : contact.type === 'phone' ? (
                      <a href={`tel:${contact.value.replace(/\D/g, '')}`} className="hover:text-foreground transition-colors">
                        {contact.value}
                      </a>
                    ) : (
                      <span className="whitespace-pre-line">{contact.value}</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{siteSettings.contactEmail}</span>
                </li>
              )}
            </ul>
            
            {/* Social Links as Buttons */}
            {visibleSocialLinks.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {visibleSocialLinks.slice(0, 4).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    {getSocialIcon(link.platform)}
                    <span className="truncate">{getPlatformName(link.platform)}</span>
                  </a>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Link to="/contact">
                <Button variant="outline" className="w-full">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteSettings.siteName}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with integrity. Powered by truth.
          </p>
        </div>
      </div>
    </footer>
  );
};
