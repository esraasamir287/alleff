/* Utilities for detecting and converting media URLs into embeddable formats. */

export type VideoEmbedKind = 'youtube' | 'drive' | 'vimeo' | 'direct' | 'unknown';

export interface VideoEmbed {
  kind: VideoEmbedKind;
  embedUrl: string | null;
  videoId: string | null;
  thumbnailUrl: string | null;
}

const DIRECT_VIDEO_EXTS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

function youtubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function ytResult(id: string): VideoEmbed {
  return {
    kind: 'youtube',
    embedUrl: youtubeEmbedUrl(id),
    videoId: id,
    thumbnailUrl: youtubeThumbnail(id),
  };
}

const UNKNOWN: VideoEmbed = {
  kind: 'unknown',
  embedUrl: null,
  videoId: null,
  thumbnailUrl: null,
};

export function parseVideoUrl(url: string): VideoEmbed {
  const trimmed = url.trim();
  if (!trimmed) return UNKNOWN;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      return id ? ytResult(id) : UNKNOWN;
    }

    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        return id ? ytResult(id) : UNKNOWN;
      }
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.slice('/embed/'.length).split('/')[0];
        return id ? ytResult(id) : UNKNOWN;
      }
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.slice('/shorts/'.length).split('/')[0];
        return id ? ytResult(id) : UNKNOWN;
      }
    }

    if (host.endsWith('vimeo.com')) {
      const segments = u.pathname.split('/').filter(Boolean);
      const id = segments[0];
      return id && /^\d+$/.test(id)
        ? {
            kind: 'vimeo',
            embedUrl: `https://player.vimeo.com/video/${id}`,
            videoId: id,
            thumbnailUrl: null,
          }
        : UNKNOWN;
    }

    if (host.endsWith('drive.google.com')) {
      const match = u.pathname.match(/\/file\/d\/([^/]+)/);
      const id = match?.[1] ?? u.searchParams.get('id');
      return id
        ? {
            kind: 'drive',
            embedUrl: `https://drive.google.com/file/d/${id}/preview`,
            videoId: id,
            thumbnailUrl: null,
          }
        : UNKNOWN;
    }

    if (host.endsWith('googleapis.com') || host.endsWith('googleusercontent.com')) {
      return { kind: 'direct', embedUrl: null, videoId: null, thumbnailUrl: null };
    }

    const lower = trimmed.toLowerCase();
    if (DIRECT_VIDEO_EXTS.some((ext) => lower.includes(ext))) {
      return { kind: 'direct', embedUrl: null, videoId: null, thumbnailUrl: null };
    }

    return UNKNOWN;
  } catch {
    return UNKNOWN;
  }
}

export type PdfEmbedKind = 'drive' | 'direct' | 'unknown';

export interface PdfEmbed {
  kind: PdfEmbedKind;
  embedUrl: string | null;
}

export function parsePdfUrl(url: string): PdfEmbed {
  const trimmed = url.trim();
  if (!trimmed) return { kind: 'unknown', embedUrl: null };

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '');

    if (host.endsWith('drive.google.com')) {
      const match = u.pathname.match(/\/file\/d\/([^/]+)/);
      const id = match?.[1] ?? u.searchParams.get('id');
      return id
        ? { kind: 'drive', embedUrl: `https://drive.google.com/file/d/${id}/preview` }
        : { kind: 'unknown', embedUrl: null };
    }

    const lower = trimmed.toLowerCase();
    if (lower.endsWith('.pdf') || lower.includes('.pdf?')) {
      return { kind: 'direct', embedUrl: trimmed };
    }

    return { kind: 'unknown', embedUrl: null };
  } catch {
    return { kind: 'unknown', embedUrl: null };
  }
}
