import { useState } from 'react';
import { categories as initialCategories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Save, FolderOpen, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Category } from '@/types/news';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getCategories, saveCategories, CategoryConfig } from '@/lib/settingsService';

interface CategoryItem {
  id: Category;
  name: string;
  description: string;
}

const AdminCategories = () => {
  const { hasPermission } = useAdminAuth();
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(getCategories(initialCategories) as CategoryItem[]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: ''
  });

  const canManageCategories = hasPermission('manageCategories');

  // If user doesn't have permission, show restricted view
  if (!canManageCategories) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to manage categories. Only administrators can access this section.
        </p>
      </div>
    );
  }

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ id: '', name: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: CategoryItem) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedList: CategoryItem[];
    if (editingCategory) {
      updatedList = categoriesList.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, name: formData.name, description: formData.description }
          : cat
      );
      toast.success('Category updated successfully!');
    } else {
      const newCategory: CategoryItem = {
        id: formData.name.toLowerCase().replace(/\s+/g, '-') as Category,
        name: formData.name,
        description: formData.description
      };
      updatedList = [...categoriesList, newCategory];
      toast.success('Category created successfully!');
    }

    setCategoriesList(updatedList);
    saveCategories(updatedList as CategoryConfig[]);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const updatedList = categoriesList.filter(cat => cat.id !== id);
      setCategoriesList(updatedList);
      saveCategories(updatedList as CategoryConfig[]);
      toast.success('Category deleted successfully!');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesList.map((category) => (
          <div key={category.id} className="rounded-xl bg-card p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h3 className="font-display font-semibold text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            <p className="text-xs text-muted-foreground mt-3">ID: {category.id}</p>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category details.' : 'Create a new category for articles.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
