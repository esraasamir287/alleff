import { UserCircle } from 'lucide-react';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export function Instructor() {
  return (
    <section id="instructor" className="bg-soft py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Photo placeholder */}
          <div className="order-first flex justify-center lg:order-last">
            <div className="relative">
              <div className="absolute -inset-3 rounded-5xl brand-gradient opacity-20 blur-2xl" />
              <div className="relative flex h-72 w-72 items-center justify-center rounded-5xl border-2 border-dashed border-secondary-300 bg-white sm:h-80 sm:w-80">
                <img src="https://res.cloudinary.com/vnvyddkj/image/upload/v1784836550/ChatGPT_Image_Jul_23_2026_10_55_17_PM_au3vts.png" alt="Allef" className="object-contain" />
        
              
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-start gap-5 text-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-bold text-secondary-700">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              عن المدرّسة
            </span>
            <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">
              م. إسراء سمير
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              تتركّز فكرة Allef حول تبسيط مادة البرمجة والذكاء الاصطناعي لطلبة البكالوريا،
              وتقديمها بأسلوب واضح وعملي يساعد الطالب على الفهم والتطبيق والاستعداد للامتحان بثقة.
            </p>
            <WhatsAppButton variant="secondary" size="md" label="تواصل مع م. إسراء عبر واتساب" />
          </div>
        </div>
      </div>
    </section>
  );
}
