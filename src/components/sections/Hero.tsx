import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { WhatsAppButton } from '../ui/WhatsAppButton';
import { HeroIllustration } from '../ui/HeroIllustration';
import { useAuth } from '../../context/useAuth';

export function Hero() {
  const { user, loading } = useAuth();
  const showAuthCtas = !loading && !user;

  return (
    <section id="home" className="relative overflow-hidden bg-soft pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-secondary-100/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-10 h-80 w-80 rounded-full bg-lavender/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Text */}
        <div className="flex flex-col items-start gap-6 text-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-secondary shadow-soft">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            منصة Allef التعليمية لطلبة البكالوريا
          </span>

          <h1 className="text-balance text-4xl font-extrabold leading-tight text-primary sm:text-5xl lg:text-6xl">
            افهم <span className="brand-gradient-text">البرمجة والذكاء الاصطناعي</span> على منصة Allef بطريقة بسيطة وواضحة
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Allef منصة تعليمية مخصصة لطلبة البكالوريا (عربي ولغات) تساعدك على فهم مادة البرمجة والذكاء الاصطناعي
            خطوة بخطوة، بشرح مبسّط وأسلوب عملي يهيّئك للامتحان بثقة.
          </p>

          {showAuthCtas && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Button as="link" to="/signup" variant="primary" size="lg">
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                  ابدأ رحلتك التعليمية
                </Button>
                <WhatsAppButton variant="secondary" size="lg" />
              </div>

              <div className="flex items-center gap-4 pt-2 text-sm font-bold text-primary/70">
                <Link to="/login" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  تسجيل الدخول
                </Link>
                <span className="h-4 w-px bg-primary/20" />
                <Link to="/signup" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  إنشاء حساب
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Illustration */}
        <div className="relative order-first lg:order-last">
          <div className="animate-float-soft">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
