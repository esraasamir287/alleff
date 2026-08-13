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
  Loader2,
  MessageCircle,
  UploadCloud,
  X,
} from 'lucide-react';
import type { Plan } from './Pricing';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/useAuth';

const INSTAPAY_NUMBER = '01025123193';
const VODAFONE_NUMBER = '01025123193';
const WHATSAPP_NUMBER = '201025123193';

type PaymentMethod = 'instapay' | 'vodafone_cash';

interface SubscriptionCheckoutProps {
  plan: Plan;
  onClose: () => void;
}

export function SubscriptionCheckout({ plan, onClose }: SubscriptionCheckoutProps) {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('instapay');
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
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
    setSelectedFile(event.target.files?.[0] ?? null);
    setSubmitError(null);
  }

  function copyNumber(value: string) {
    void navigator.clipboard?.writeText(value);
  }

  async function handleUpload() {
    if (!user) {
      setSubmitError('يجب تسجيل الدخول أولًا لرفع إيصال الدفع.');
      return;
    }
    if (!selectedFile) {
      setSubmitError('يرجى اختيار صورة الإيصال أولًا.');
      return;
    }

    setUploading(true);
    setSubmitError(null);
    try {
      const ext = selectedFile.name.split('.').pop() || 'png';
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, selectedFile, { contentType: selectedFile.type, upsert: false });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('subscription_requests').insert({
        user_id: user.id,
        package_name: planName,
        price: plan.price,
        payment_method: paymentMethod,
        receipt_path: filePath,
        status: 'pending',
        student_name: studentName || null,
      });

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err) {
      setSubmitError('تعذّر رفع الإيصال وحفظ الطلب. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setUploading(false);
    }
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

        <header className="mx-auto max-w-2xl px-8 text-center">
          <div className="flex items-center justify-center gap-3 text-[#c7a5ff]">
            <span className="h-px w-10 bg-[#8f62eb]" />
            <span className="text-xl">✦</span>
            <span className="h-px w-10 bg-[#8f62eb]" />
          </div>
          <h1 id="checkout-title" className="mt-1 text-3xl font-black text-white sm:text-5xl">إتمام الاشتراك</h1>
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
            <p className="mt-2 text-sm text-white/70">اختر وسيلة الدفع وحوّل المبلغ:</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PaymentCard
                method="instapay"
                label="InstaPay"
                number={INSTAPAY_NUMBER}
                selected={paymentMethod === 'instapay'}
                onSelect={() => setPaymentMethod('instapay')}
                onCopy={() => copyNumber(INSTAPAY_NUMBER)}
              />
              <PaymentCard
                method="vodafone_cash"
                label="Vodafone Cash"
                number={VODAFONE_NUMBER}
                selected={paymentMethod === 'vodafone_cash'}
                onSelect={() => setPaymentMethod('vodafone_cash')}
                onCopy={() => copyNumber(VODAFONE_NUMBER)}
              />
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

              {submitted ? (
                <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-[#22e879]/40 bg-[#16a34a]/15 px-4 py-5 text-center">
                  <Check className="h-8 w-8 text-[#22e879]" aria-hidden="true" />
                  <p className="text-sm font-bold text-white">تم رفع الإيصال وحفظ طلبك بنجاح</p>
                  <p className="text-xs text-white/70">سيتم مراجعة الطلب وتفعيل اشتراكك خلال 24 ساعة عمل.</p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b17fff] bg-[#5c25cf] px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#6c32df] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d3b8ff]"
                  >
                    <ImagePlus className="h-5 w-5" aria-hidden="true" />
                    {selectedFile ? selectedFile.name : 'رفع صورة التحويل'}
                  </button>
                  <p className="mt-2 text-center text-xs text-white/60">PNG, JPG حتى 10MB</p>

                  {submitError && (
                    <p className="mt-3 rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-center text-xs font-bold text-red-200">
                      {submitError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5c25cf] px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#6c32df] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d3b8ff]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        جارٍ الرفع...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-5 w-5" aria-hidden="true" />
                        حفظ الإيصال
                      </>
                    )}
                  </button>
                </>
              )}
            </section>

            <section className="rounded-[1.35rem] border border-[#6f4ad5]/45 bg-[#100d48]/90 p-4 text-white sm:p-5">
              <h2 className="flex items-center gap-2 text-xl font-black text-white">
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

function PaymentCard({
  method,
  label,
  number,
  selected,
  onSelect,
  onCopy,
}: {
  method: PaymentMethod;
  label: string;
  number: string;
  selected: boolean;
  onSelect: () => void;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl bg-[#f7f6ff] p-4 text-center text-[#171236] transition ring-offset-2 ring-offset-[#100d48] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b17fff] ${
        selected ? 'ring-2 ring-[#5c25cf] shadow-lg' : 'ring-0 hover:shadow-md'
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-center gap-2">
        {method === 'instapay' ? <InstaPayLogo /> : <VodafoneCashLogo />}
        <span className="text-base font-black">{label}</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#c6b9ed] px-2 py-2.5 text-lg font-black text-[#4e27bd]">
        {number}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onCopy(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); onCopy(); } }}
          className="rounded-md p-1 text-[#655b8d] transition hover:bg-[#e9e3ff]"
          aria-label={`نسخ رقم ${label}`}
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

function InstaPayLogo() {
  return (
    <svg
      viewBox="0 0 198 128"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-auto"
      role="img"
      aria-label="InstaPay"
      fill="none"
    >
      <path
        d="M 190 13 L 185 8 L 177 5 L 133 5 L 115 23 L 169 23 L 173 26 L 174 31 L 172 35 L 167 40 L 165 40 L 164 41 L 121 41 L 103 57 L 97 78 L 114 78 L 119 65 L 119 62 L 121 59 L 161 59 L 162 58 L 167 57 L 178 51 L 186 43 L 187 40 L 190 36 L 190 34 L 192 30 L 193 21 Z M 159 100 L 157 98 L 154 98 L 131 122 L 138 122 L 152 107 L 154 108 L 155 116 L 154 117 L 146 117 L 143 121 L 141 122 L 164 122 L 162 112 L 161 111 L 161 108 L 160 107 L 160 104 L 159 103 Z M 141 100 L 138 98 L 122 98 L 117 103 L 134 103 L 136 105 L 136 107 L 133 110 L 114 110 L 112 113 L 112 116 L 111 117 L 110 122 L 115 122 L 118 116 L 130 116 L 131 115 L 136 114 L 141 108 L 141 106 L 142 105 Z M 167 122 L 172 122 L 175 114 L 192 98 L 185 98 L 175 108 L 173 106 L 170 98 L 163 98 L 164 102 L 166 105 L 166 107 L 169 112 L 169 117 Z"
        fill="#7D569E"
        fillRule="evenodd"
      />
      <path
        d="M 100 4 L 81 4 L 81 6 L 83 8 L 93 27 L 98 34 L 101 41 L 59 78 L 78 78 L 80 77 L 120 41 L 119 37 L 117 35 L 107 16 L 102 9 Z M 71 4 L 52 4 L 52 5 L 54 7 L 56 12 L 58 14 L 60 19 L 62 21 L 64 26 L 72 39 L 72 41 L 47 64 L 46 64 L 39 71 L 38 71 L 31 78 L 30 78 L 50 78 L 58 70 L 59 70 L 66 63 L 67 63 L 74 56 L 75 56 L 82 49 L 83 49 L 92 41 Z"
        fill="#E7937F"
        fillRule="evenodd"
      />
      <path
        d="M 37 32 L 20 32 L 17 39 L 16 45 L 14 48 L 14 51 L 13 52 L 5 78 L 22 78 Z M 73 98 L 53 98 L 49 100 L 45 106 L 45 109 L 47 111 L 49 111 L 50 112 L 63 112 L 65 114 L 62 117 L 45 117 L 40 122 L 60 122 L 65 120 L 69 115 L 69 109 L 67 107 L 53 107 L 51 105 L 53 103 L 68 103 Z M 23 98 L 21 101 L 21 103 L 14 122 L 19 122 L 23 109 L 24 108 L 27 111 L 32 120 L 34 122 L 36 122 L 39 118 L 45 98 L 40 98 L 40 100 L 37 107 L 37 110 L 35 112 L 28 101 L 25 98 Z M 108 100 L 106 98 L 104 98 L 101 100 L 81 122 L 87 122 L 101 107 L 102 107 L 104 110 L 105 116 L 104 117 L 96 117 L 91 122 L 109 122 L 109 120 L 111 116 L 111 111 L 109 107 Z M 29 5 L 28 6 L 23 23 L 40 23 L 41 18 L 43 15 L 44 9 L 46 5 Z M 96 98 L 76 98 L 71 103 L 78 103 L 79 104 L 73 122 L 78 122 L 78 120 L 80 117 L 81 111 L 84 104 L 85 103 L 91 103 Z M 17 98 L 13 98 L 12 99 L 5 122 L 9 122 L 10 121 Z"
        fill="#522A74"
        fillRule="evenodd"
      />
    </svg>
  );
}

function VodafoneCashLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 808 632"
      className="h-10 w-auto"
      role="img"
      aria-label="Vodafone Cash"
    >
      <rect width="808" height="632" fill="#C2272D" />
      <path
        d="M 382 417 L 371 418 L 372 453 L 370 460 L 366 463 L 355 463 L 349 456 L 349 433 L 354 432 L 354 423 L 339 423 L 339 459 L 343 467 L 347 470 L 353 472 L 368 472 L 375 469 L 379 465 L 382 457 Z M 566 430 L 567 442 L 573 451 L 586 456 L 598 454 L 602 455 L 600 460 L 594 463 L 594 472 L 605 469 L 610 464 L 613 455 L 649 456 L 659 453 L 666 446 L 669 435 L 668 427 L 665 421 L 660 416 L 648 412 L 635 414 L 625 422 L 623 427 L 624 447 L 618 447 L 613 442 L 612 428 L 609 421 L 604 416 L 597 413 L 588 412 L 576 415 L 571 419 Z M 639 422 L 649 421 L 656 426 L 658 430 L 658 438 L 653 445 L 649 447 L 642 447 L 634 440 L 633 431 Z M 586 421 L 593 421 L 597 423 L 602 431 L 601 440 L 593 447 L 586 447 L 582 445 L 577 438 L 577 430 L 579 426 Z M 529 412 L 529 421 L 539 421 L 547 427 L 548 439 L 539 447 L 521 447 L 521 456 L 539 456 L 549 453 L 555 448 L 558 442 L 558 426 L 554 419 L 547 414 Z M 389 430 L 390 442 L 396 451 L 409 456 L 421 454 L 425 455 L 423 460 L 417 463 L 417 472 L 428 469 L 432 465 L 436 455 L 476 455 L 483 452 L 491 441 L 491 428 L 488 421 L 483 416 L 471 412 L 458 414 L 448 422 L 445 432 L 448 445 L 447 447 L 441 447 L 437 444 L 435 440 L 435 429 L 432 421 L 427 416 L 420 413 L 410 412 L 399 415 L 393 420 Z M 465 421 L 472 421 L 476 423 L 481 431 L 479 442 L 472 447 L 465 447 L 461 445 L 456 438 L 456 430 L 458 426 Z M 409 421 L 416 421 L 421 424 L 425 432 L 423 441 L 416 447 L 409 447 L 400 439 L 400 429 Z M 134 435 L 134 457 L 137 465 L 141 469 L 148 472 L 159 472 L 166 469 L 171 464 L 174 455 L 185 456 L 198 452 L 203 455 L 213 456 L 224 452 L 230 442 L 230 422 L 235 421 L 235 412 L 220 412 L 220 440 L 213 447 L 206 446 L 202 441 L 202 422 L 207 421 L 207 412 L 191 413 L 191 441 L 185 447 L 177 446 L 173 440 L 173 422 L 178 421 L 178 412 L 163 412 L 163 456 L 157 463 L 150 463 L 145 458 L 144 435 Z M 355 410 L 357 415 L 361 416 L 365 414 L 365 409 L 362 407 Z M 499 402 L 499 456 L 513 456 L 513 447 L 508 445 L 508 402 Z M 641 398 L 641 404 L 650 404 L 650 398 Z M 464 398 L 463 401 L 465 405 L 471 405 L 473 403 L 473 399 L 471 397 Z M 207 397 L 205 399 L 205 403 L 207 405 L 213 405 L 215 402 L 214 398 Z M 192 398 L 191 402 L 193 405 L 201 404 L 201 399 L 199 397 Z M 180 397 L 178 399 L 178 403 L 180 405 L 186 405 L 188 402 L 187 398 Z M 314 384 L 267 411 L 271 421 L 286 421 L 293 426 L 295 437 L 293 442 L 286 447 L 260 447 L 254 442 L 253 402 L 243 402 L 243 441 L 249 452 L 260 456 L 285 456 L 297 452 L 302 447 L 305 440 L 304 425 L 297 416 L 289 413 L 288 411 L 314 396 Z M 355 95 L 345 100 L 337 113 L 337 225 L 332 230 L 320 237 L 304 242 L 292 243 L 303 247 L 335 252 L 337 254 L 337 358 L 345 371 L 359 377 L 446 376 L 453 373 L 460 366 L 464 356 L 464 241 L 475 233 L 492 216 L 504 198 L 464 175 L 464 112 L 462 104 L 457 98 L 449 95 Z M 418 338 L 420 336 L 437 336 L 438 354 L 419 355 Z M 362 337 L 380 336 L 381 354 L 363 355 Z M 389 332 L 410 332 L 412 334 L 412 357 L 410 359 L 389 359 L 387 357 L 387 334 Z M 448 251 L 447 314 L 347 313 L 348 254 L 405 257 L 428 255 L 445 250 Z M 503 198 L 491 216 L 470 236 L 450 248 L 431 254 L 416 256 L 373 256 L 327 251 L 300 245 L 303 242 L 319 238 L 337 227 L 346 218 L 356 202 L 359 203 L 364 212 L 373 221 L 377 223 L 383 223 L 386 221 L 404 200 L 419 177 L 429 157 Z M 446 114 L 448 116 L 447 165 L 429 155 L 424 167 L 408 193 L 392 214 L 381 223 L 374 221 L 365 212 L 357 198 L 349 212 L 347 211 L 348 114 Z"
        fill="#FFFFFF"
        fillRule="evenodd"
      />
    </svg>
  );
}
