import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ClipboardCheck,
  Copy,
  GraduationCap,
  ImagePlus,
  Landmark,
  MessageCircle,
  UploadCloud,
  X,
} from 'lucide-react';
import type { Plan } from './Pricing';

const TRANSFER_NUMBER = '01025123193';
const WHATSAPP_NUMBER = '201025123193';

interface SubscriptionCheckoutProps {
  plan: Plan;
  onClose: () => void;
}

export function SubscriptionCheckout({ plan, onClose }: SubscriptionCheckoutProps) {
  const [studentName, setStudentName] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const planName = `الصف ${plan.grade} ${plan.system} - ${plan.period}`;
  const whatsappMessage = `السلام عليكم، تم التحويل للاشتراك في باقة ${planName} بقيمة ${plan.price} جنيه. الاسم: ${studentName || '[اسم الطالب]'}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileName(event.target.files?.[0]?.name ?? '');
  }

  function copyNumber() {
    void navigator.clipboard?.writeText(TRANSFER_NUMBER);
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#050425]/95 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      dir="rtl"
    >
      <div className="pointer-events-none fixed -left-32 top-16 h-80 w-80 rounded-full bg-[#6337dd]/25 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 bottom-0 h-96 w-96 rounded-full bg-[#263da5]/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a5ff]"
          aria-label="إغلاق صفحة الاشتراك"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <header className="mx-auto max-w-2xl px-8 text-center text-white">
          <div className="flex items-center justify-center gap-3 text-[#c7a5ff]">
            <span className="h-px w-10 bg-[#8f62eb]" />
            <span className="text-xl">✦</span>
            <span className="h-px w-10 bg-[#8f62eb]" />
          </div>
          <h1 id="checkout-title" className="mt-1 text-3xl font-black sm:text-5xl">إتمام الاشتراك</h1>
          <p className="mt-2 text-sm text-white/75 sm:text-base">راجع تفاصيل الباقة وأكمل التحويل ثم ارفع إثبات الدفع</p>
        </header>

        <div className="mx-auto mt-6 flex max-w-4xl items-center justify-center gap-1 text-xs font-bold text-white/80 sm:gap-3 sm:text-sm">
          <Step number="1" label="حول المبلغ" icon={<Landmark className="h-4 w-4" />} active />
          <span className="h-px w-8 border-t border-dotted border-[#a979f6] sm:w-20" />
          <Step number="2" label="ارفع صورة التحويل" icon={<UploadCloud className="h-4 w-4" />} />
          <span className="h-px w-8 border-t border-dotted border-[#a979f6] sm:w-20" />
          <Step number="3" label="أرسل التأكيد عبر واتساب" icon={<MessageCircle className="h-4 w-4" />} />
        </div>

        <section className="mt-5 overflow-hidden rounded-[1.5rem] border-4 border-white/80 bg-[#f7f6ff] p-3 shadow-[0_0_35px_rgba(152,108,255,0.28)] sm:p-4">
          <div className="grid items-stretch gap-3 lg:grid-cols-[1.1fr_1fr_1fr_1.25fr] lg:gap-0">
            <SummaryItem icon={<GraduationCap className="h-7 w-7" />} label="الصف" value={`الصف ${plan.grade} البكالوريا`} />
            <SummaryItem icon={<BookOpen className="h-7 w-7" />} label="المسار" value={plan.system} />
            <SummaryItem icon={<CalendarDays className="h-7 w-7" />} label="المدة" value={plan.period} />
            <div className="order-first flex flex-col justify-center rounded-2xl bg-gradient-to-br from-[#5b25d1] to-[#321080] px-6 py-5 text-center text-white shadow-lg lg:order-none">
              <span className="text-sm font-bold text-white/80">السعر</span>
              <strong className="mt-1 text-4xl font-black leading-none sm:text-5xl">{plan.price}</strong>
              <span className="mt-1 text-sm font-bold text-white/80">جنيه</span>
            </div>
          </div>
          <div className="mt-3 border-t border-[#d8d2ef] pt-3 text-center">
            <h2 className="text-base font-black text-[#332078]">تفاصيل الباقة</h2>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-[#19143d] sm:text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5423c9] text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.05fr]">
          <section className="rounded-[1.35rem] border border-[#6f4ad5]/45 bg-[#100d48]/90 p-4 text-white sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Landmark className="h-6 w-6 text-[#c7a5ff]" aria-hidden="true" />
                بيانات التحويل
              </h2>
              <span className="rounded-full border border-[#8458e5] px-3 py-1 text-sm font-black text-white">
                {plan.price} جنيه
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">المبلغ المطلوب تحويله:</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PaymentCard label="InstaPay" number={TRANSFER_NUMBER} onCopy={copyNumber} />
              <PaymentCard label="Vodafone Cash" number={TRANSFER_NUMBER} onCopy={copyNumber} />
            </div>
            <div className="mt-4 rounded-xl border border-[#6f4ad5]/40 bg-white/[0.06] px-4 py-3 text-center text-xs leading-relaxed text-white/80">
              بعد التحويل احتفظ بصورة الإيصال لنتمكن من رفعها وإثبات الدفع.
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <section className="rounded-[1.35rem] border border-[#6f4ad5]/45 bg-[#100d48]/90 p-4 text-white sm:p-5">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <UploadCloud className="h-6 w-6 text-[#c7a5ff]" aria-hidden="true" />
                رفع إثبات التحويل
              </h2>
              <p className="mt-1 text-xs text-white/70">قم بتحميل صورة واضحة من شاشة التحويل (Screenshot)</p>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileChange} className="sr-only" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b17fff] bg-[#5c25cf] px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#6c32df] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d3b8ff]"
              >
                <ImagePlus className="h-5 w-5" aria-hidden="true" />
                {fileName || 'رفع صورة التحويل'}
              </button>
              <p className="mt-2 text-center text-xs text-white/60">PNG, JPG حتى 10MB</p>
            </section>

            <section className="rounded-[1.35rem] border border-[#6f4ad5]/45 bg-[#100d48]/90 p-4 text-white sm:p-5">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <MessageCircle className="h-6 w-6 text-[#22e879]" aria-hidden="true" />
                إرسال التأكيد عبر واتساب
              </h2>
              <label className="mt-3 block text-sm font-bold text-white/80" htmlFor="student-name">اسم الطالب</label>
              <input
                id="student-name"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="اكتب اسم الطالب"
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-right text-sm text-white outline-none placeholder:text-white/45 focus:border-[#b17fff] focus:ring-2 focus:ring-[#7e4de5]/40"
              />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1bbd59] px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#16a94e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7cf5aa]"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                إرسال عبر واتساب
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="mt-3 text-center text-xs leading-relaxed text-white/65">سيتم فتح واتساب وإرسال الرسالة تلقائيًا</p>
            </section>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-2xl items-center justify-center gap-2 rounded-full border border-[#6f4ad5]/50 bg-[#100d48]/75 px-4 py-3 text-center text-xs text-white/80 sm:text-sm">
          <ClipboardCheck className="h-5 w-5 shrink-0 text-[#c7a5ff]" aria-hidden="true" />
          سيتم التأكد من التحويل وتفعيل اشتراكك خلال 24 ساعة عمل
        </div>
      </div>
    </div>
  );
}

function Step({ number, label, icon, active = false }: { number: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-2 py-1.5 sm:gap-2 sm:px-3 ${active ? 'border-[#7950df] bg-[#30206f]' : 'border-[#3f3184] bg-[#100d48]'}`}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4c2ab3] text-sm font-black text-white">{number}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{icon}</span>
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-center gap-3 border-b border-[#d8d2ef] py-3 text-center lg:border-b-0 lg:border-l lg:px-4 last:lg:border-l-0">
      <span className="text-[#4e27bd]">{icon}</span>
      <div>
        <p className="text-xs font-bold text-[#625b82]">{label}</p>
        <p className="mt-1 text-base font-black text-[#171236]">{value}</p>
      </div>
    </div>
  );
}

function PaymentCard({ label, number, onCopy }: { label: string; number: string; onCopy: () => void }) {
  return (
    <div className="rounded-2xl bg-[#f7f6ff] p-4 text-center text-[#171236]">
      <div className="flex items-center justify-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${label === 'InstaPay' ? 'bg-[#1e255f]' : 'bg-[#e62727]'}`}>
          {label === 'InstaPay' ? 'IP' : 'V'}
        </span>
        <span className="text-base font-black">{label}</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#c6b9ed] px-2 py-2.5 text-lg font-black text-[#4e27bd]">
        {number}
        <button type="button" onClick={onCopy} className="rounded-md p-1 text-[#655b8d] transition hover:bg-[#e9e3ff]" aria-label={`نسخ رقم ${label}`}>
          <Copy className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
