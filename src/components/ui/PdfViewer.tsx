import { ExternalLink, X } from 'lucide-react';
import { parsePdfUrl } from '../../lib/mediaUrl';

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
  onClose?: () => void;
}

export function PdfViewer({ pdfUrl, title, onClose }: PdfViewerProps) {
  const { kind, embedUrl } = parsePdfUrl(pdfUrl);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#cdeed5] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[#e0f4e6] bg-[#f5fcf7] px-4 py-3">
        <p className="truncate text-xs font-extrabold text-[#1a6b3a]">
          {title ?? 'مذكرة الدرس'}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[#6b9c78] transition hover:bg-[#e8f7ee] hover:text-[#1a6b3a]"
            aria-label="إغلاق المذكرة"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="h-[480px] w-full"
          title={title ?? 'مذكرة الدرس'}
        />
      ) : (
        <div className="flex h-[200px] w-full items-center justify-center bg-[#f5fcf7]">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#27a454] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#249e4b]"
          >
            <ExternalLink className="h-4 w-4" />
            فتح الملف
          </a>
        </div>
      )}
    </div>
  );
}
