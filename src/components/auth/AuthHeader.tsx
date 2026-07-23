import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function AuthHeader() {
  return (
    <div className="flex items-center justify-between">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-secondary"
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
        العودة إلى الرئيسية
      </Link>
      <Link to="/" className="flex items-center" aria-label="الصفحة الرئيسية">
        <img src="/image.png" alt="Allef" className="h-9 w-auto" />
      </Link>
    </div>
  );
}
