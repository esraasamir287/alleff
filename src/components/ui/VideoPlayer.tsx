import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ExternalLink, PlayCircle, X, Youtube } from 'lucide-react';
import { parseVideoUrl } from '../../lib/mediaUrl';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onClose?: () => void;
}

const FALLBACK_TIMEOUT_MS = 5000;

export function VideoPlayer({ videoUrl, title, onClose }: VideoPlayerProps) {
  const { kind, embedUrl, thumbnailUrl } = parseVideoUrl(videoUrl);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);

  const watchUrl = videoUrl.trim();

  const autoplayEmbed = (() => {
    if (!embedUrl || kind !== 'youtube') return embedUrl;

    const url = new URL(embedUrl);
    url.searchParams.set('autoplay', '1');

    return url.toString();
  })();

  useEffect(() => {
    if (!playing) {
      loadedRef.current = false;
      setFailed(false);
      return;
    }

    const timer = window.setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, FALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [playing]);

  const showFallback = failed && (kind === 'youtube' || kind === 'vimeo' || kind === 'drive');

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
        {playing && (kind === 'youtube' || kind === 'vimeo' || kind === 'drive') && autoplayEmbed && !showFallback ? (
          <div className="relative aspect-video w-full">
            <iframe
              src={autoplayEmbed}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={title ?? 'فيديو الشرح'}
              onLoad={() => { loadedRef.current = true; }}
            />
          </div>
        ) : showFallback ? (
          <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
              <PlayCircle className="h-7 w-7 text-white" />
            </span>
            <p className="max-w-sm px-6 text-sm font-medium leading-relaxed text-white/90">
              تعذّر تشغيل الفيديو داخل الموقع. يمكنك مشاهدته مباشرة على يوتيوب.
            </p>
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-red-500"
            >
              <Youtube className="h-4 w-4" />
              افتح على يوتيوب
            </a>
          </div>
        ) : (kind === 'youtube' || kind === 'vimeo' || kind === 'drive') && embedUrl ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block aspect-video w-full cursor-pointer overflow-hidden bg-black"
            aria-label="تشغيل الفيديو"
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title ?? 'فيديو الشرح'}
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/15">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition group-hover:scale-110 group-hover:bg-red-500">
                <PlayCircle className="h-9 w-9 text-white" />
              </span>
            </div>
            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
                <Youtube className="h-3.5 w-3.5" />
                اضغط للتشغيل
              </span>
            </div>
          </button>
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
              href={watchUrl}
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

      {(kind === 'youtube' || kind === 'vimeo' || kind === 'drive') && !playing && embedUrl && (
        <div className="flex items-center justify-between gap-2 border-t border-[#eeeaf8] bg-[#faf8ff] px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#8c88a6]">
            <AlertCircle className="h-3.5 w-3.5" />
            لو الفيديو لم يشتغل، افتحه على يوتيوب
          </span>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#3c3672] shadow-sm transition hover:bg-[#f0ebff]"
          >
            <Youtube className="h-3.5 w-3.5" />
            فتح على يوتيوب
          </a>
        </div>
      )}
    </div>
  );
}
