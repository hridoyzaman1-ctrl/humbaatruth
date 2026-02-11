import { useState } from 'react';
import { Save, Menu, Plus, Trash2, Eye, EyeOff, ExternalLink, Folder, FileText, LayoutDashboard, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { headerMenuItems as initialMenuItems, categories } from '@/data/mockData';
import { MenuItem } from '@/types/news';
import { toast } from 'sonner';
import { getMenuSettings, saveMenuSettings } from '@/lib/settingsService';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(getMenuSettings(initialMenuItems));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    label: '',
    path: '',
    type: 'page',
    isVisible: true,
    highlight: false,
    icon: '',
    showInMainNav: true
  });

  const toggleVisibility = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
  };

  const toggleHighlight = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, highlight: !item.highlight } : item
    ));
  };

  const toggleMainNav = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, showInMainNav: !item.showInMainNav } : item
    ));
  };

  const updateItem = (id: string, field: keyof MenuItem, value: string | boolean) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast.success('Menu item deleted');
  };

  const addNewItem = () => {
    if (!newItem.label || !newItem.path) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newMenuItem: MenuItem = {
      id: Date.now().toString(),
      label: newItem.label,
      path: newItem.path,
      type: newItem.type as 'category' | 'page' | 'external',
      isVisible: newItem.isVisible ?? true,
      order: menuItems.length + 1,
      highlight: newItem.highlight,
      icon: newItem.icon,
      showInMainNav: newItem.showInMainNav ?? true
    };

    setMenuItems([...menuItems, newMenuItem]);
    setNewItem({ label: '', path: '', type: 'page', isVisible: true, highlight: false, icon: '', showInMainNav: true });
    setIsAddDialogOpen(false);
    toast.success('Menu item added successfully');
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = menuItems.findIndex(item => item.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === menuItems.length - 1)) {
      return;
    }

    const newItems = [...menuItems];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

    newItems.forEach((item, i) => {
      item.order = i + 1;
    });

    setMenuItems(newItems);
  };

  const handleSave = () => {
    saveMenuSettings(menuItems);
    toast.success('Menu settings saved successfully!');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'category': return <Folder className="h-4 w-4" />;
      case 'external': return <ExternalLink className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const mainNavItems = menuItems.filter(item => item.showInMainNav && item.isVisible);
  const moreItems = menuItems.filter(item => !item.showInMainNav && item.isVisible);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Header Menu Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control which items appear in main nav vs "More" dropdown
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="sm:size-default">
                <Plus className="mr-1 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Add Item</span><span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
                <DialogDescription>
                  Create a new navigation link for the header menu
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Label *</Label>
                  <Input
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="e.g., About Us"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Path/URL *</Label>
                  <Input
                    value={newItem.path}
                    onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                    placeholder="e.g., /about or https://..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(v) => setNewItem({ ...newItem, type: v as 'category' | 'page' | 'external' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="page">Internal Page</SelectItem>
                      <SelectItem value="external">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Icon (emoji, optional)</Label>
                  <Input
                    value={newItem.icon}
                    onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                    placeholder="e.g., 🎓 or 📰"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show in Main Nav</Label>
                  <Switch
                    checked={newItem.showInMainNav}
                    onCheckedChange={(v) => setNewItem({ ...newItem, showInMainNav: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Highlight (colored text)</Label>
                  <Switch
                    checked={newItem.highlight}
                    onCheckedChange={(v) => setNewItem({ ...newItem, highlight: v })}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button onClick={addNewItem} className="w-full sm:w-auto">Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} size="sm" className="sm:size-default">
            <Save className="mr-1 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Save Changes</span><span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All Items</TabsTrigger>
          <TabsTrigger value="main" className="text-xs sm:text-sm">Main Nav ({mainNavItems.length})</TabsTrigger>
          <TabsTrigger value="more" className="text-xs sm:text-sm">More ({moreItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Menu Items List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Menu className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">All Menu Items</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">
                    Toggle "Main Nav" to control where items appear
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {menuItems.sort((a, b) => a.order - b.order).map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg border ${item.isVisible ? 'border-border bg-card' : 'border-dashed border-muted bg-muted/30 opacity-60'}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex flex-col gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveItem(item.id, 'up')}
                              disabled={index === 0}
                            >
                              ▲
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveItem(item.id, 'down')}
                              disabled={index === menuItems.length - 1}
                            >
                              ▼
                            </Button>
                          </div>

                          <span className="text-xs font-bold text-muted-foreground w-5">{index + 1}</span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.icon && <span className="text-sm">{item.icon}</span>}
                              <span className="font-medium text-sm truncate">{item.label}</span>
                              <Badge variant={item.type === 'category' ? 'default' : item.type === 'external' ? 'secondary' : 'outline'} className="text-[9px] px-1.5">
                                {item.type}
                              </Badge>
                              {item.showInMainNav ? (
                                <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-[9px] px-1.5">
                                  <LayoutDashboard className="h-2.5 w-2.5 mr-0.5" />
                                  Main
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 text-[9px] px-1.5">
                                  <MoreHorizontal className="h-2.5 w-2.5 mr-0.5" />
                                  More
                                </Badge>
                              )}
                              {item.highlight && (
                                <Badge className="bg-primary/20 text-primary text-[9px] px-1.5">★</Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate block mt-0.5">{item.path}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-auto">
                          <Button
                            variant={item.showInMainNav ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleMainNav(item.id)}
                            className="h-7 text-[10px] px-2"
                          >
                            {item.showInMainNav ? 'Main' : 'More'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleHighlight(item.id)}
                            title="Toggle highlight"
                            className="h-7 w-7"
                          >
                            <span className={item.highlight ? 'text-primary' : 'text-muted-foreground'}>★</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleVisibility(item.id)}
                            title={item.isVisible ? 'Hide' : 'Show'}
                            className="h-7 w-7"
                          >
                            {item.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteItem(item.id)}
                            className="h-7 w-7 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Add */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Add Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                    {categories.filter(c => !menuItems.some(m => m.path === `/category/${c.id}`)).slice(0, 4).map((category) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => {
                          const newMenuItem: MenuItem = {
                            id: Date.now().toString(),
                            label: category.name,
                            path: `/category/${category.id}`,
                            type: 'category',
                            isVisible: true,
                            order: menuItems.length + 1,
                            showInMainNav: false
                          };
                          setMenuItems([...menuItems, newMenuItem]);
                          toast.success(`Added ${category.name}`);
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {category.name}
                      </Button>
                    ))}
                    {categories.filter(c => !menuItems.some(m => m.path === `/category/${c.id}`)).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2 col-span-2 sm:col-span-1">
                        All categories added
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Add Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                    {[
                      { label: 'About Us', path: '/about' },
                      { label: 'Contact', path: '/contact' },
                      { label: 'Careers', path: '/careers' },
                    ].filter(p => !menuItems.some(m => m.path === p.path)).map((page) => (
                      <Button
                        key={page.path}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => {
                          const newMenuItem: MenuItem = {
                            id: Date.now().toString(),
                            label: page.label,
                            path: page.path,
                            type: 'page',
                            isVisible: true,
                            order: menuItems.length + 1,
                            showInMainNav: false
                          };
                          setMenuItems([...menuItems, newMenuItem]);
                          toast.success(`Added ${page.label}`);
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {page.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="main">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base">Main Navigation Items</CardTitle>
              </div>
              <CardDescription className="text-xs">
                These items appear directly in the header navigation bar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mainNavItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No items in main nav. Toggle items from "All Items" tab.
                </p>
              ) : (
                <div className="space-y-2">
                  {mainNavItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-green-500/30 bg-green-500/5">
                      <div className="flex items-center gap-2">
                        {item.icon && <span>{item.icon}</span>}
                        <span className="font-medium text-sm">{item.label}</span>
                        <Badge variant="outline" className="text-[9px]">{item.type}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMainNav(item.id)}
                        className="h-7 text-xs"
                      >
                        Move to More
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="more">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MoreHorizontal className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-base">"More" Dropdown Items</CardTitle>
              </div>
              <CardDescription className="text-xs">
                These items appear in the "More" dropdown menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {moreItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No items in "More" dropdown. Toggle items from "All Items" tab.
                </p>
              ) : (
                <div className="space-y-2">
                  {moreItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-500/30 bg-orange-500/5">
                      <div className="flex items-center gap-2">
                        {item.icon && <span>{item.icon}</span>}
                        <span className="font-medium text-sm">{item.label}</span>
                        <Badge variant="outline" className="text-[9px]">{item.type}</Badge>
                        {item.highlight && <Badge className="bg-primary/20 text-primary text-[9px]">★</Badge>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMainNav(item.id)}
                        className="h-7 text-xs"
                      >
                        Move to Main
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMenu;
