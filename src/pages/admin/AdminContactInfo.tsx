import { useState } from 'react';
import { Save, Plus, Trash2, Mail, Phone, MapPin, Eye, EyeOff, Building, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactInfo, AboutInfo } from '@/data/siteContactData';
import { getContacts, saveContacts, getAboutInfo, saveAboutInfo } from '@/lib/contactService';
import { toast } from 'sonner';
import { useAdminAuth } from '@/context/AdminAuthContext';

const AdminContactInfo = () => {
  const { hasPermission } = useAdminAuth();
  const [contacts, setContacts] = useState<ContactInfo[]>(getContacts());
  const [aboutInfo, setAboutInfo] = useState<AboutInfo[]>(getAboutInfo());
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddAboutOpen, setIsAddAboutOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null);
  const [editingAbout, setEditingAbout] = useState<AboutInfo | null>(null);

  const canManageContactInfo = hasPermission('manageContactInfo');

  // If user doesn't have permission, show restricted view
  if (!canManageContactInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to manage contact information. Only administrators can access this section.
        </p>
      </div>
    );
  }

  const [newContact, setNewContact] = useState<Partial<ContactInfo>>({
    type: 'email',
    label: '',
    value: '',
    isVisible: true,
    showInFooter: false,
    showOnContactPage: true,
  });

  const [newAbout, setNewAbout] = useState<Partial<AboutInfo>>({
    section: 'general',
    title: '',
    content: '',
    icon: '',
    isVisible: true,
  });

  const getTypeIcon = (type: ContactInfo['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'address': return <MapPin className="h-4 w-4" />;
    }
  };

  // Contact CRUD operations
  const addContact = () => {
    if (!newContact.label || !newContact.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    const contact: ContactInfo = {
      id: Date.now().toString(),
      type: newContact.type as ContactInfo['type'],
      label: newContact.label,
      value: newContact.value,
      isVisible: newContact.isVisible ?? true,
      order: contacts.length + 1,
      showInFooter: newContact.showInFooter ?? false,
      showOnContactPage: newContact.showOnContactPage ?? true,
    };

    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    saveContacts(updatedContacts);
    setNewContact({ type: 'email', label: '', value: '', isVisible: true, showInFooter: false, showOnContactPage: true });
    setIsAddContactOpen(false);
    toast.success('Contact added successfully');
  };

  const updateContact = (id: string, updates: Partial<ContactInfo>) => {
    const updatedContacts = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    setContacts(updatedContacts);
    saveContacts(updatedContacts);
  };

  const deleteContact = (id: string) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    setContacts(updatedContacts);
    saveContacts(updatedContacts);
    toast.success('Contact deleted');
  };

  // About CRUD operations
  const addAboutItem = () => {
    if (!newAbout.title || !newAbout.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const about: AboutInfo = {
      id: Date.now().toString(),
      section: newAbout.section as AboutInfo['section'],
      title: newAbout.title,
      content: newAbout.content,
      icon: newAbout.icon,
      isVisible: newAbout.isVisible ?? true,
      order: aboutInfo.length + 1,
    };

    const updatedAbout = [...aboutInfo, about];
    setAboutInfo(updatedAbout);
    saveAboutInfo(updatedAbout);
    setNewAbout({ section: 'general', title: '', content: '', icon: '', isVisible: true });
    setIsAddAboutOpen(false);
    toast.success('About item added successfully');
  };

  const updateAboutItem = (id: string, updates: Partial<AboutInfo>) => {
    const updatedAbout = aboutInfo.map(a => a.id === id ? { ...a, ...updates } : a);
    setAboutInfo(updatedAbout);
    saveAboutInfo(updatedAbout);
  };

  const deleteAboutItem = (id: string) => {
    const updatedAbout = aboutInfo.filter(a => a.id !== id);
    setAboutInfo(updatedAbout);
    saveAboutInfo(updatedAbout);
    toast.success('About item deleted');
  };

  const handleSave = () => {
    // Already saved on each operation, but this confirms for UX
    toast.success('Contact & About information saved successfully!');
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Contact & About Info</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage contact information displayed across the site
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="mr-2 h-4 w-4" /> Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="contacts">Contact Info ({contacts.length})</TabsTrigger>
          <TabsTrigger value="about">About Info ({aboutInfo.length})</TabsTrigger>
        </TabsList>

        {/* Contact Info Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Contact Information</CardTitle>
                </div>
                <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-4 w-4" /> Add Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                      <DialogDescription>
                        Add a new contact method for visitors to reach you
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Type *</Label>
                        <Select
                          value={newContact.type}
                          onValueChange={(v) => setNewContact({ ...newContact, type: v as ContactInfo['type'] })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="address">Address</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Label *</Label>
                        <Input
                          value={newContact.label}
                          onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                          placeholder="e.g., General Inquiries, Press Contact"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Value *</Label>
                        {newContact.type === 'address' ? (
                          <Textarea
                            value={newContact.value}
                            onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                            placeholder="123 News Street&#10;Media City, MC 12345"
                            className="mt-1"
                            rows={3}
                          />
                        ) : (
                          <Input
                            value={newContact.value}
                            onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                            placeholder={newContact.type === 'email' ? 'email@example.com' : '+1 (555) 123-4567'}
                            className="mt-1"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Show in Footer</Label>
                        <Switch
                          checked={newContact.showInFooter}
                          onCheckedChange={(v) => setNewContact({ ...newContact, showInFooter: v })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Show on Contact Page</Label>
                        <Switch
                          checked={newContact.showOnContactPage}
                          onCheckedChange={(v) => setNewContact({ ...newContact, showOnContactPage: v })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>Cancel</Button>
                      <Button onClick={addContact}>Add Contact</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Email addresses, phone numbers, and addresses shown on the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.sort((a, b) => a.order - b.order).map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border ${contact.isVisible ? 'border-border bg-card' : 'border-dashed border-muted bg-muted/30 opacity-60'
                      }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                        {getTypeIcon(contact.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{contact.label}</span>
                          <Badge variant="outline" className="text-[10px]">{contact.type}</Badge>
                          {contact.showInFooter && (
                            <Badge className="bg-green-500/20 text-green-600 text-[10px]">Footer</Badge>
                          )}
                          {contact.showOnContactPage && (
                            <Badge className="bg-blue-500/20 text-blue-600 text-[10px]">Contact Page</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{contact.value}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateContact(contact.id, { showInFooter: !contact.showInFooter })}
                        title={contact.showInFooter ? 'Remove from footer' : 'Add to footer'}
                        className="h-8 w-8"
                      >
                        <Building className={`h-4 w-4 ${contact.showInFooter ? 'text-green-500' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateContact(contact.id, { isVisible: !contact.isVisible })}
                        title={contact.isVisible ? 'Hide' : 'Show'}
                        className="h-8 w-8"
                      >
                        {contact.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteContact(contact.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {contacts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No contact information added yet. Click "Add Contact" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Info Tab */}
        <TabsContent value="about">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">About Information</CardTitle>
                </div>
                <Dialog open={isAddAboutOpen} onOpenChange={setIsAddAboutOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-4 w-4" /> Add About Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add About Item</DialogTitle>
                      <DialogDescription>
                        Add content to the About page
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Section *</Label>
                        <Select
                          value={newAbout.section}
                          onValueChange={(v) => setNewAbout({ ...newAbout, section: v as AboutInfo['section'] })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mission">Mission</SelectItem>
                            <SelectItem value="vision">Vision</SelectItem>
                            <SelectItem value="value">Core Value</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Title *</Label>
                        <Input
                          value={newAbout.title}
                          onChange={(e) => setNewAbout({ ...newAbout, title: e.target.value })}
                          placeholder="e.g., Our Mission"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Content *</Label>
                        <Textarea
                          value={newAbout.content}
                          onChange={(e) => setNewAbout({ ...newAbout, content: e.target.value })}
                          placeholder="Describe this section..."
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label>Icon (optional)</Label>
                        <Input
                          value={newAbout.icon}
                          onChange={(e) => setNewAbout({ ...newAbout, icon: e.target.value })}
                          placeholder="e.g., Target, Eye, Shield, Users"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Use Lucide icon names</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddAboutOpen(false)}>Cancel</Button>
                      <Button onClick={addAboutItem}>Add Item</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Mission, vision, and core values displayed on the About page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aboutInfo.sort((a, b) => a.order - b.order).map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-3 p-4 rounded-lg border ${item.isVisible ? 'border-border bg-card' : 'border-dashed border-muted bg-muted/30 opacity-60'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{item.title}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{item.section}</Badge>
                          {item.icon && (
                            <Badge className="bg-primary/20 text-primary text-[10px]">{item.icon}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateAboutItem(item.id, { isVisible: !item.isVisible })}
                          title={item.isVisible ? 'Hide' : 'Show'}
                          className="h-8 w-8"
                        >
                          {item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAboutItem(item.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {aboutInfo.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No about information added yet. Click "Add About Item" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>How your contact info will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Footer Contacts</h4>
              {contacts.filter(c => c.isVisible && c.showInFooter).length > 0 ? (
                contacts.filter(c => c.isVisible && c.showInFooter).map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-sm">
                    {getTypeIcon(c.type)}
                    <span>{c.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No footer contacts set</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <h4 className="font-medium text-sm text-muted-foreground">Contact Page Emails</h4>
              <div className="flex flex-wrap gap-2">
                {contacts.filter(c => c.isVisible && c.showOnContactPage && c.type === 'email').map(c => (
                  <Badge key={c.id} variant="outline">{c.value}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContactInfo;
