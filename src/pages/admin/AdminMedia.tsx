import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Grid, List, Trash2, Copy, Search, Image, Video, FileText, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import {
  getMediaList,
  uploadMedia,
  deleteMedia,
  bulkDeleteMedia,
  validateFile,
  formatSize,
  type MediaItem
} from '@/lib/mediaService';

const AdminMedia = () => {
  const { hasPermission, currentUser } = useAdminAuth();
  const { logActivity } = useActivityLog();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = hasPermission('uploadMedia');
  const canDeleteAll = hasPermission('deleteAllMedia');
  const canDeleteOwn = hasPermission('deleteOwnMedia');

  // Load media on mount
  useEffect(() => {
    loadMedia();

    const handleUpdate = () => loadMedia();
    window.addEventListener('mediaUpdated', handleUpdate);
    return () => window.removeEventListener('mediaUpdated', handleUpdate);
  }, []);

  const loadMedia = async () => {
    setIsLoading(true);
    const data = await getMediaList();
    setMediaList(data);
    setIsLoading(false);
  };

  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of Array.from(files)) {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        errorCount++;
        continue;
      }

      try {
        await uploadMedia(file, currentUser?.id);
        successCount++;
        logActivity('upload', 'media', {
          resourceName: file.name,
          details: `Uploaded ${file.name} (${formatSize(file.size)})`
        });
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
      await loadMedia();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) failed to upload`);
    }

    setIsUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (item: MediaItem) => {
    if (!canDeleteAll && !canDeleteOwn) {
      toast.error('You do not have permission to delete media');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      await deleteMedia(item.id, item.file_name);
      logActivity('delete', 'media', {
        resourceId: item.id,
        resourceName: item.name,
        details: 'Deleted media file'
      });
      toast.success('Media deleted successfully!');
      await loadMedia();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete media');
    }
  };

  const handleBulkDelete = async () => {
    if (!canDeleteAll) {
      toast.error('You do not have permission to bulk delete media');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }
    if (!window.confirm(`Delete ${selectedItems.length} items?`)) return;

    const items = mediaList
      .filter(m => selectedItems.includes(m.id))
      .map(m => ({ id: m.id, file_name: m.file_name }));

    try {
      await bulkDeleteMedia(items);
      logActivity('bulk_delete', 'media', {
        details: `Bulk deleted ${items.length} media files`
      });
      setSelectedItems([]);
      toast.success('Media deleted successfully!');
      await loadMedia();
    } catch (err: any) {
      toast.error(err.message || 'Failed to bulk delete');
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-500 text-white';
      case 'video': return 'bg-purple-500 text-white';
      default: return 'bg-amber-500 text-white';
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and manage images, videos, and documents (max 10MB each)
          </p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedItems.length})
            </Button>
          )}
          {canUpload && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/ogg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-md">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading media...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-xl border-dashed">
          <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No media files found</p>
          <p className="text-sm">Upload images, videos, or documents to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div key={item.id} className="group relative bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="h-4 w-4 rounded"
                />
              </div>
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                ) : item.type === 'video' ? (
                  <Video className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate" title={item.name}>{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge className={`text-[10px] ${getTypeBadgeColor(item.type)}`}>{item.type}</Badge>
                  <span className="text-[10px] text-muted-foreground">{formatSize(item.size_bytes)}</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyUrl(item.url)} title="Copy URL">
                  <Copy className="h-3 w-3" />
                </Button>
                {(canDeleteAll || canDeleteOwn) && (
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(item)} title="Delete">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMedia.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="h-4 w-4"
              />
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  getTypeIcon(item.type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-[10px] ${getTypeBadgeColor(item.type)}`}>{item.type}</Badge>
                  <span className="text-xs text-muted-foreground">{formatSize(item.size_bytes)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyUrl(item.url)}>
                  <Copy className="h-3 w-3" />
                </Button>
                {(canDeleteAll || canDeleteOwn) && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        {filteredMedia.length} file(s) · Allowed: Images (PNG, JPEG, GIF, WebP, SVG), Videos (MP4, WebM, OGG), Documents (PDF, DOC, DOCX, TXT) · Max 10MB per file
      </div>
    </div>
  );
};

export default AdminMedia;
