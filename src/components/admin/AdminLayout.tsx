import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, LogOut, Loader2, Menu, X, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', to: '/admin', icon: LayoutDashboard },
  { label: 'الطلاب', to: '/admin/students', icon: Users },
  { label: 'طلبات الاشتراك', to: '/admin/subscriptions', icon: ClipboardList },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    await logout();
    navigate('/admin?loggedout=true', { replace: true });
  }

  const isActive = (to: string) =>
    to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-soft">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col border-l border-secondary-100 bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <img src="/image.png" alt="Allef" className="h-9 w-auto" />
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  active
                    ? 'bg-secondary-50 text-secondary-700'
                    : 'text-muted hover:bg-soft hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.label}
                {active && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-accent" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-secondary-100 px-3 py-4">
          <div className="mb-3 px-4">
            <p className="truncate text-xs font-bold text-ink">{user?.email}</p>
            <p className="text-[11px] text-muted">مشرف</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-5 w-5" aria-hidden="true" />
            )}
            {signingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-soft-lg">
            <div className="flex items-center justify-between px-5 py-5">
              <img src="/image.png" alt="Allef" className="h-9 w-auto" />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-soft hover:text-primary"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      active
                        ? 'bg-secondary-50 text-secondary-700'
                        : 'text-muted hover:bg-soft hover:text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-secondary-100 px-3 py-4">
              <div className="mb-3 px-4">
                <p className="truncate text-xs font-bold text-ink">{user?.email}</p>
                <p className="text-[11px] text-muted">مشرف</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
              >
                {signingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                )}
                {signingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:mr-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-secondary-100 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-lg p-2 text-muted hover:bg-soft hover:text-primary lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-primary sm:text-2xl">{title}</h1>
                {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 px-3 py-1.5 text-xs font-bold text-secondary-700">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                لوحة المشرف
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
