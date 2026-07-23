import { MessageCircle, Mail, Facebook, Youtube } from 'lucide-react';
import { navItems } from '../../data/navItems';
import { whatsappUrl } from '../../data/whatsapp';

const socials = [
  { icon: Facebook, label: 'تابعنا على فيسبوك', href: 'https://www.facebook.com/profile.php?id=61591875872326', external: true },
  { icon: Youtube, label: 'شاهدنا على يوتيوب', href: 'https://www.youtube.com/@EsraaProgrammingAI', external: true },
  { icon: Mail, label: 'تواصل معنا عبر البريد الإلكتروني', href: 'mailto:esraasamir287@gmail.com', external: false },
];

export function Footer() {
  return (
    <footer className="brand-gradient text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <img src="/image.png" alt="Allef" className="h-10 w-auto brightness-0 invert" />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              منصة تعليمية لطلبة البكالوريا تبسّط البرمجة والذكاء الاصطناعي بطريقة واضحة وعملية مع م. إسراء سمير.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold text-accent">روابط سريعة</h3>
            <ul className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + socials */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-accent">تواصل معنا</h3>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تواصل مع م. إسراء سمير عبر واتساب"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-whatsapp-dark"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              تواصل عبر واتساب
            </a>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.external ? '_blank' : undefined}
                  rel={s.external ? 'noopener noreferrer' : undefined}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <s.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 text-center text-sm text-white/70 sm:flex-row sm:text-start">
          <p>© {new Date().getFullYear()} منصة Allef للبكالوريا. جميع الحقوق محفوظة.</p>
          <p>
            تصميم وإشراف: <span className="font-bold text-white">م. إسراء سمير</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
