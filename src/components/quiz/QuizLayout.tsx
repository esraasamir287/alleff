import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/useAuth';

interface QuizLayoutProps {
  children: ReactNode;
  showAuth?: boolean;
  isAuthenticated?: boolean;
  userName?: string;
}

export function QuizLayout({ children, showAuth = true, isAuthenticated = false, userName }: QuizLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    await logout();
    navigate('/login?loggedout=true', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-soft">
      <header className="border-b border-secondary-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to="/" className="inline-flex items-center transition-opacity hover:opacity-80">
            <img src="/image.png" alt="Allef" className="h-9 w-auto" />
          </Link>

          {showAuth && isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-bold text-ink sm:inline">
                {userName ? `مرحبًا، ${userName}` : 'مرحبًا بك'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-muted transition-colors hover:bg-soft hover:text-primary disabled:opacity-60"
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{signingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
