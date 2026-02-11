import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Globe, Bell, Shield, Share2, Facebook, Twitter, Instagram, Youtube, Linkedin, MessageCircle, Send, ExternalLink, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { socialMediaLinks as initialSocialLinks } from '@/data/mockData';
import { SocialMediaLink } from '@/types/news';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getSiteSettings, saveSiteSettings, getSocialLinks, saveSocialLinks, SiteSettingsConfig } from '@/lib/settingsService';

const AdminSettings = () => {
  const { hasPermission } = useAdminAuth();
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>(getSocialLinks(initialSocialLinks) as SocialMediaLink[]);
  const [settings, setSettings] = useState<SiteSettingsConfig>(getSiteSettings());

  const canManageSettings = hasPermission('manageSettings');

  // If user doesn't have permission, show restricted view
  if (!canManageSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to manage site settings. Only administrators can access this section.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    saveSiteSettings(settings);
    saveSocialLinks(socialLinks);
    toast.success('Settings saved successfully!');
  };

  const updateSetting = (key: keyof SiteSettingsConfig, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSocialLink = (id: string, field: keyof SocialMediaLink, value: string | boolean) => {
    setSocialLinks(prev => prev.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const getSocialIcon = (platform: string) => {
    const iconProps = { className: "h-5 w-5" };
    switch (platform) {
      case 'facebook': return <Facebook {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      case 'instagram': return <Instagram {...iconProps} />;
      case 'youtube': return <Youtube {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'tiktok': return <span className="text-lg">📱</span>;
      case 'whatsapp': return <MessageCircle {...iconProps} />;
      case 'telegram': return <Send {...iconProps} />;
      default: return <Share2 {...iconProps} />;
    }
  };

  const getSocialColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: 'bg-blue-600',
      twitter: 'bg-sky-500',
      instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
      youtube: 'bg-red-600',
      linkedin: 'bg-blue-700',
      tiktok: 'bg-black',
      whatsapp: 'bg-green-500',
      telegram: 'bg-sky-600',
    };
    return colors[platform] || 'bg-gray-500';
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Social Media Links - Featured at top */}
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                <CardTitle>Social Media Links</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {socialLinks.filter(l => l.isVisible && l.url).length} active
              </Badge>
            </div>
            <CardDescription>
              Configure social media links that appear across the website (footer, article sharing, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {socialLinks.map((link) => (
                <div
                  key={link.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${link.isVisible && link.url
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-muted/30 opacity-70'
                    }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white ${getSocialColor(link.platform)}`}>
                    {getSocialIcon(link.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{getPlatformName(link.platform)}</span>
                      {link.url && (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Input
                      value={link.url}
                      onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                      placeholder={`https://${link.platform}.com/...`}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Switch
                    checked={link.isVisible}
                    onCheckedChange={(checked) => updateSocialLink(link.id, 'isVisible', checked)}
                    disabled={!link.url}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              💡 Toggle the switch to show/hide each social icon. Icons with empty URLs are automatically hidden.
            </p>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-sm">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline" className="text-sm">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.tagline}
                  onChange={(e) => updateSetting('tagline', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription" className="text-sm">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-sm">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Comments & Newsletter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="h-5 w-5" />
              Engagement Settings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Comments and newsletter configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground">Enable Comments</p>
                <p className="text-xs text-muted-foreground">Allow users to comment on articles</p>
              </div>
              <Switch
                checked={settings.enableComments}
                onCheckedChange={(checked) => updateSetting('enableComments', checked)}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground">Moderate Comments</p>
                <p className="text-xs text-muted-foreground">Require approval before publishing</p>
              </div>
              <Switch
                checked={settings.moderateComments}
                onCheckedChange={(checked) => updateSetting('moderateComments', checked)}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground">Enable Newsletter</p>
                <p className="text-xs text-muted-foreground">Show newsletter signup forms</p>
              </div>
              <Switch
                checked={settings.enableNewsletter}
                onCheckedChange={(checked) => updateSetting('enableNewsletter', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="h-5 w-5" />
              Display Settings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Customize how content is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="articlesPerPage" className="text-sm">Articles Per Page</Label>
                <Select value={settings.articlesPerPage} onValueChange={(val) => updateSetting('articlesPerPage', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat" className="text-sm">Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={(val) => updateSetting('dateFormat', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MMM d, yyyy">Jan 14, 2026</SelectItem>
                    <SelectItem value="dd/MM/yyyy">14/01/2026</SelectItem>
                    <SelectItem value="MM/dd/yyyy">01/14/2026</SelectItem>
                    <SelectItem value="yyyy-MM-dd">2026-01-14</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(val) => updateSetting('timezone', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                    <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Take the site offline for maintenance</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
