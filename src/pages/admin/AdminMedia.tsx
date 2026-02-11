import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Image, Video, Trash2, ExternalLink, Upload, Filter, Grid, List, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useActivityLog } from '@/context/ActivityLogContext';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  uploadedAt: Date;
  size: string;
}

// Mock media items
const initialMedia: MediaItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=1200', type: 'image', name: 'climate-summit.jpg', uploadedAt: new Date('2026-01-14'), size: '2.4 MB' },
  { id: '2', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200', type: 'image', name: 'economy-chart.jpg', uploadedAt: new Date('2026-01-13'), size: '1.8 MB' },
  { id: '3', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200', type: 'image', name: 'workers.jpg', uploadedAt: new Date('2026-01-12'), size: '3.2 MB' },
  { id: '4', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200', type: 'image', name: 'tech-privacy.jpg', uploadedAt: new Date('2026-01-11'), size: '2.1 MB' },
  { id: '5', url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200', type: 'image', name: 'summit.jpg', uploadedAt: new Date('2026-01-10'), size: '1.5 MB' },
  { id: '6', url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200', type: 'image', name: 'culture-art.jpg', uploadedAt: new Date('2026-01-09'), size: '2.8 MB' },
];

const AdminMedia = () => {
  const { hasPermission, currentUser } = useAdminAuth();
  const { logActivity } = useActivityLog();
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const canUpload = hasPermission('uploadMedia');
  const canViewAll = hasPermission('viewAllMedia');
  const canDeleteAll = hasPermission('deleteAllMedia');
  const canDeleteOwn = hasPermission('deleteOwnMedia');

  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    if (!canDeleteAll && !canDeleteOwn) {
      toast.error('You do not have permission to delete media');
      return;
    }
    const item = mediaList.find(m => m.id === id);
    if (window.confirm('Are you sure you want to delete this media?')) {
      setMediaList(prev => prev.filter(item => item.id !== id));
      logActivity('delete', 'media', {
        resourceId: id,
        resourceName: item?.name,
        details: 'Deleted media file'
      });
      toast.success('Media deleted successfully!');
    }
  };

  const handleBulkDelete = () => {
    if (!canDeleteAll) {
      toast.error('You do not have permission to bulk delete media');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      const count = selectedItems.length;
      setMediaList(prev => prev.filter(item => !selectedItems.includes(item.id)));
      logActivity('bulk_delete', 'media', {
        details: `Bulk deleted ${count} media files`
      });
      setSelectedItems([]);
      toast.success('Media deleted successfully!');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Media Library</h1>
          {!canViewAll && (
            <p className="text-sm text-muted-foreground mt-1">Showing your uploaded media only</p>
          )}
        </div>
        {canUpload && (
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && canDeleteAll && (
        <div className="mb-4 flex items-center gap-4 p-3 rounded-lg bg-muted">
          <span className="text-sm text-foreground">{selectedItems.length} items selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-xl overflow-hidden bg-card border-2 transition-colors ${selectedItems.includes(item.id) ? 'border-primary' : 'border-border'
                }`}
            >
              <div className="aspect-video relative">
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                  {canDeleteAll && (
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="h-4 w-4 rounded"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyUrl(item.url)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {(canDeleteAll || canDeleteOwn) && (
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {item.type === 'image' ? <Image className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                </Badge>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.size}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl bg-card border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  {canDeleteAll && (
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredMedia.length && filteredMedia.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredMedia.map(i => i.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="h-4 w-4 rounded"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Preview</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Size</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    {canDeleteAll && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="h-4 w-4 rounded"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <img src={item.url} alt="" className="h-10 w-14 rounded object-cover" />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">{item.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.size}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => copyUrl(item.url)}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {(canDeleteAll || canDeleteOwn) && (
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List View (Compact Row) */}
          <div className="md:hidden space-y-2">
            {canDeleteAll && filteredMedia.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg mb-2">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredMedia.length && filteredMedia.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(filteredMedia.map(i => i.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  className="h-4 w-4 rounded"
                />
                <span className="text-xs font-medium">Select All</span>
              </div>
            )}

            {filteredMedia.map((item) => (
              <div key={item.id} className="bg-card p-3 rounded-lg border border-border flex items-center gap-3 shadow-sm">
                {canDeleteAll && (
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="h-4 w-4 rounded flex-shrink-0"
                  />
                )}
                <div className="h-12 w-16 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                  {item.type === 'video' && <div className="absolute inset-0 flex items-center justify-center"><Video className="h-4 w-4 text-white drop-shadow" /></div>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{item.size}</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">{item.type}</Badge>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyUrl(item.url)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {(canDeleteAll || canDeleteOwn) && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {filteredMedia.length === 0 && (
        <div className="rounded-xl bg-muted p-12 text-center">
          <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No media found</p>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
