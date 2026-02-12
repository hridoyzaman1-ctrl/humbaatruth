import { supabase } from './supabase';

export interface MediaItem {
    id: string;
    name: string;
    file_name: string;
    url: string;
    type: 'image' | 'video' | 'document';
    size_bytes: number;
    mime_type: string;
    uploaded_by: string | null;
    created_at: string;
}

// Allowed MIME types
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]
};

const ALL_ALLOWED = [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.video, ...ALLOWED_MIME_TYPES.document];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getMediaType = (mime: string): 'image' | 'video' | 'document' => {
    if (ALLOWED_MIME_TYPES.image.includes(mime)) return 'image';
    if (ALLOWED_MIME_TYPES.video.includes(mime)) return 'video';
    return 'document';
};

const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
        return `File "${file.name}" exceeds the 10MB limit (${formatSize(file.size)})`;
    }
    if (!ALL_ALLOWED.includes(file.type)) {
        return `File type "${file.type || 'unknown'}" is not allowed. Accepted: images, videos, PDF, DOC, DOCX, TXT`;
    }
    return null;
};

export const getMediaList = async (): Promise<MediaItem[]> => {
    const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching media:', error);
        return [];
    }
    return data || [];
};

export const uploadMedia = async (file: File, uploaderId?: string): Promise<MediaItem | null> => {
    // Validate
    const validationError = validateFile(file);
    if (validationError) {
        throw new Error(validationError);
    }

    // Generate unique file path
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `uploads/${timestamp}_${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Save metadata to media table
    const mediaType = getMediaType(file.type);
    const { data, error: dbError } = await supabase
        .from('media')
        .insert({
            name: file.name,
            file_name: filePath,
            url: publicUrl,
            type: mediaType,
            size_bytes: file.size,
            mime_type: file.type,
            uploaded_by: uploaderId || null
        })
        .select()
        .single();

    if (dbError) {
        console.error('DB insert error:', dbError);
        // Try to clean up the uploaded file
        await supabase.storage.from('media').remove([filePath]);
        throw new Error(`Failed to save media metadata: ${dbError.message}`);
    }

    window.dispatchEvent(new Event('mediaUpdated'));
    return data;
};

export const deleteMedia = async (id: string, fileName: string): Promise<void> => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('media')
        .remove([fileName]);

    if (storageError) {
        console.error('Storage delete error:', storageError);
    }

    // Delete from DB
    const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

    if (dbError) throw new Error(`Failed to delete media: ${dbError.message}`);
    window.dispatchEvent(new Event('mediaUpdated'));
};

export const bulkDeleteMedia = async (items: { id: string; file_name: string }[]): Promise<void> => {
    // Delete from storage
    const filePaths = items.map(i => i.file_name);
    await supabase.storage.from('media').remove(filePaths);

    // Delete from DB
    const ids = items.map(i => i.id);
    const { error } = await supabase
        .from('media')
        .delete()
        .in('id', ids);

    if (error) throw new Error(`Failed to bulk delete: ${error.message}`);
    window.dispatchEvent(new Event('mediaUpdated'));
};

export { formatSize, MAX_FILE_SIZE, ALL_ALLOWED };
