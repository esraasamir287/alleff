import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '../../data/whatsapp';

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل مع م. إسراء سمير عبر واتساب"
      className={`fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-soft-lg transition-all duration-300 hover:bg-whatsapp-dark hover:scale-110 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <span className="animate-pulse-ring relative flex h-14 w-14 items-center justify-center rounded-full" />
      <MessageCircle className="relative h-7 w-7" aria-hidden="true" />
    </a>
  );
}
