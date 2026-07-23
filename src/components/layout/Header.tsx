import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ClipboardList, Video } from 'lucide-react';
import { navItems } from '../../data/navItems';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/useAuth';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, loading, profileLoading, logout } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const displayName = profile?.fullName ?? '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/?loggedout=true');
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/90 shadow-soft backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#home" className="flex items-center" aria-label="الصفحة الرئيسية">
          <img src="/image%20copy%20copy.png" alt="Allef" className="h-[52px] w-[52px] object-contain" />
        </a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-0.5 whitespace-nowrap lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-bold text-primary/80 transition-colors hover:bg-soft hover:text-primary"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs — wait for auth init to avoid flicker */}
        <div className="hidden items-center gap-1.5 whitespace-nowrap lg:flex">
          {loading || (isAuthenticated && profileLoading) ? null : isAuthenticated ? (
            <>
              <span className="max-w-[100px] truncate text-[13px] font-extrabold text-primary" title={displayName}>
                {displayName}
              </span>
              <Button as="link" to="/quiz" variant="ghost" size="sm">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                الامتحان
              </Button>
              <Button as="link" to="/subscribe" variant="ghost" size="sm">
                <Video className="h-4 w-4" aria-hidden="true" />
                الاشتراك أونلاين
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <>
              <Button as="link" to="/login" variant="ghost" size="sm">
                تسجيل الدخول
              </Button>
              <Button as="link" to="/signup" variant="primary" size="sm">
                إنشاء حساب
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-primary lg:hidden"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 top-[64px] z-30 bg-primary/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-40 mx-4 mb-4 rounded-3xl border border-secondary-100 bg-white p-4 shadow-soft-lg">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-base font-bold text-primary transition-colors hover:bg-soft"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2 border-t border-soft pt-4">
              {loading || (isAuthenticated && profileLoading) ? null : isAuthenticated ? (
                <>
                  <span className="px-4 py-2 text-base font-extrabold text-primary" title={displayName}>
                    {displayName}
                  </span>
                  <Button as="link" to="/quiz" variant="ghost" size="md" onClick={() => setOpen(false)}>
                    <ClipboardList className="h-4 w-4" aria-hidden="true" />
                    الامتحان
                  </Button>
                  <Button as="link" to="/subscribe" variant="ghost" size="md" onClick={() => setOpen(false)}>
                    <Video className="h-4 w-4" aria-hidden="true" />
                    الاشتراك أونلاين
                  </Button>
                  <Button type="button" variant="outline" size="md" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Button as="link" to="/login" variant="outline" size="md" onClick={() => setOpen(false)}>
                    تسجيل الدخول
                  </Button>
                  <Button as="link" to="/signup" variant="primary" size="md" onClick={() => setOpen(false)}>
                    إنشاء حساب
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
