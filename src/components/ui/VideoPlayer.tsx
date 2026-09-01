import { useEffect, useRef, useState } from 'react';
import { ExternalLink, PlayCircle, X, Youtube } from 'lucide-react';
import { parseVideoUrl } from '../../lib/mediaUrl';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onClose?: () => void;
}

const FALLBACK_TIMEOUT_MS = 4000;

export function VideoPlayer({ videoUrl, title, onClose }: VideoPlayerProps) {
  const { kind, embedUrl } = parseVideoUrl(videoUrl);
  const [embedFailed, setEmbedFailed] = useState(false);
  const embedLoadedRef = useRef(false);

  useEffect(() => {
    setEmbedFailed(false);
    embedLoadedRef.current = false;

    if (kind === 'direct' || !embedUrl) return;

    const timer = window.setTimeout(() => {
      if (!embedLoadedRef.current) setEmbedFailed(true);
    }, FALLBACK_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [embedUrl, kind]);

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
        {(kind === 'youtube' || kind === 'vimeo' || kind === 'drive') && embedUrl ? (
          <div className="relative aspect-video w-full">
            <iframe
              src={embedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title={title ?? 'فيديو الشرح'}
              onLoad={() => { embedLoadedRef.current = true; }}
            />
            {embedFailed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#171745] bg-cover bg-center px-5 text-center" role="status">
                <PlayCircle className="h-10 w-10 text-white" aria-hidden="true" />
                <p className="max-w-xs text-xs font-bold leading-relaxed text-white/90">تعذّر عرض الفيديو داخل المعاينة. يمكنك فتحه مباشرة على يوتيوب.</p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#171745] transition hover:bg-white/90"
                >
                  <Youtube className="h-4 w-4" />
                  فتح على يوتيوب
                </a>
              </div>
            )}
          </div>
        ) : kind === 'direct' ? (
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-[#1a1a2e]">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <ExternalLink className="h-4 w-4" />
              فتح الفيديو
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
