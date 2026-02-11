import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Maximize2 } from 'lucide-react';
import { getYoutubeId } from '@/lib/videoUtils';

interface FloatingVideoPlayerProps {
    videoUrl: string;
    title: string;
    isVisible: boolean; // Managed by parent based on scroll
}

export const FloatingVideoPlayer = ({ videoUrl, title, isVisible }: FloatingVideoPlayerProps) => {
    const [isClosed, setIsClosed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // If user explicitly closes specific video session, resetting when URL changes
    useEffect(() => {
        setIsClosed(false);
    }, [videoUrl]);

    if (isClosed || !isVisible) return null;

    const youtubeId = getYoutubeId(videoUrl);
    if (!youtubeId) return null;

    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&enablejsapi=1`;

    // Dynamic positioning logic
    const containerClass = isExpanded
        ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        : "fixed bottom-4 right-4 z-40 w-80 md:w-96 shadow-2xl rounded-lg overflow-hidden border border-border bg-background animate-in slide-in-from-bottom-10 fade-in duration-300";

    return (
        <div className={containerClass}>
            <div className={`relative ${isExpanded ? 'w-full max-w-4xl aspect-video' : 'aspect-video'}`}>
                <iframe
                    src={embedUrl}
                    title={title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />

                {/* Controls Overlay */}
                <div className="absolute top-0 right-0 p-2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-l from-black/60 to-transparent">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => setIsClosed(true)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
