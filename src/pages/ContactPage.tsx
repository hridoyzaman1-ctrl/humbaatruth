import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { contactInfoData } from '@/data/siteContactData';

const ContactPage = () => {
  const contacts = contactInfoData.filter(c => c.isVisible && c.showOnContactPage).sort((a, b) => a.order - b.order);
  
  const emailContacts = contacts.filter(c => c.type === 'email');
  const phoneContacts = contacts.filter(c => c.type === 'phone');
  const addressContacts = contacts.filter(c => c.type === 'address');

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Contact Us
          </h1>
          <p className="mt-4 text-primary-foreground/80">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Email Contacts */}
            {emailContacts.length > 0 && (
              <div className="rounded-xl bg-card p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    {emailContacts.map((contact) => (
                      <div key={contact.id} className="mt-1">
                        <p className="text-xs text-muted-foreground/70">{contact.label}</p>
                        <a 
                          href={`mailto:${contact.value}`}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {contact.value}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Phone Contacts */}
            {phoneContacts.length > 0 && (
              <div className="rounded-xl bg-card p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    {phoneContacts.map((contact) => (
                      <div key={contact.id} className="mt-1">
                        <p className="text-xs text-muted-foreground/70">{contact.label}</p>
                        <a 
                          href={`tel:${contact.value.replace(/\D/g, '')}`}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {contact.value}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Address Contacts */}
            {addressContacts.length > 0 && (
              <div className="rounded-xl bg-card p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Address</h3>
                    {addressContacts.map((contact) => (
                      <div key={contact.id} className="mt-1">
                        <p className="text-xs text-muted-foreground/70">{contact.label}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {contact.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-card p-8 border border-border">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Send us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    rows={6}
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
