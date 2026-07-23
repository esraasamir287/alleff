import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { WhatsAppButton } from '../ui/WhatsAppButton';
import { useAuth } from '../../context/useAuth';

export function FinalCTA() {
  const { user, loading } = useAuth();
  const showAuthCtas = !loading && !user;

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-5xl brand-gradient px-6 py-14 text-center sm:px-12 lg:py-20">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-2xl" />

          <div className="relative flex flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              ابدأ اليوم
            </span>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              خطوتك الأولى نحو فهم البرمجة والذكاء الاصطناعي تبدأ هنا
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              سواء كنت طالبًا تستعد للامتحان أو ولي أمر يتابع تعلّم ابنك،
              تواصل معنا الآن أو أنشئ حسابك لاحقًا للانضمام إلى Allef.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <WhatsAppButton variant="secondary" size="lg" label="تواصل عبر واتساب" />
              {showAuthCtas && (
                <>
                  <Button
                    as="link"
                    to="/signup"
                    variant="accent"
                    size="lg"
                  >
                    <UserPlus className="h-5 w-5" aria-hidden="true" />
                    إنشاء حساب
                  </Button>
                  <Button
                    as="link"
                    to="/login"
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/15"
                  >
                    <LogIn className="h-5 w-5" aria-hidden="true" />
                    تسجيل الدخول
                  </Button>
                </>
              )}
            </div>

            <a
              href="#about"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white/70 transition-colors hover:text-white"
            >
              تعرّف على Allef أكثر
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
