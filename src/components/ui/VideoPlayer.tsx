import { X } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onClose?: () => void;
}

export function VideoPlayer({ videoUrl, title, onClose }: VideoPlayerProps) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#e1d7ff] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[#eeeaf8] bg-[#faf8ff] px-4 py-3">
        <p className="truncate text-xs font-extrabold text-[#3c3672]">
          {title ?? 'فيديو الشرح'}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[#8c88a6] transition hover:bg-[#f0ebff] hover:text-[#5d4bc1]"
            aria-label="إغلاق الفيديو"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div dir="ltr" className="w-full bg-black">
        <video
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full"
        />
      </div>
    </div>
  );
}
