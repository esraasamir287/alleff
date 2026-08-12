import { Check, Globe2, Laptop, MessageCircle, PlaySquare, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

type Plan = {
  period: '3 أشهر' | 'شهر واحد';
  grade: 'أولى' | 'ثانية';
  system: 'عربي' | 'لغات';
  price: number;
  color: 'violet' | 'blue' | 'green' | 'cyan';
};

const plans: Plan[] = [
  { period: '3 أشهر', grade: 'أولى', system: 'عربي', price: 350, color: 'violet' },
  { period: '3 أشهر', grade: 'أولى', system: 'لغات', price: 400, color: 'blue' },
  { period: '3 أشهر', grade: 'ثانية', system: 'عربي', price: 400, color: 'green' },
  { period: '3 أشهر', grade: 'ثانية', system: 'لغات', price: 500, color: 'cyan' },
  { period: 'شهر واحد', grade: 'أولى', system: 'عربي', price: 150, color: 'violet' },
  { period: 'شهر واحد', grade: 'أولى', system: 'لغات', price: 200, color: 'blue' },
  { period: 'شهر واحد', grade: 'ثانية', system: 'عربي', price: 150, color: 'green' },
  { period: 'شهر واحد', grade: 'ثانية', system: 'لغات', price: 200, color: 'cyan' },
];

const colorClasses = {
  violet: {
    badge: 'bg-[#6941c6]',
    icon: 'bg-[#5630bd]',
    accent: 'text-[#5432b4]',
    button: 'bg-[#4c20b7] hover:bg-[#3e159d]',
  },
  blue: {
    badge: 'bg-[#2563d7]',
    icon: 'bg-[#2164d3]',
    accent: 'text-[#1d5ecb]',
    button: 'bg-[#1558c8] hover:bg-[#0c47ad]',
  },
  green: {
    badge: 'bg-[#3d9d48]',
    icon: 'bg-[#31913d]',
    accent: 'text-[#278a36]',
    button: 'bg-[#20852e] hover:bg-[#176d24]',
  },
  cyan: {
    badge: 'bg-[#1c91a9]',
    icon: 'bg-[#198ca5]',
    accent: 'text-[#16839a]',
    button: 'bg-[#127e98] hover:bg-[#0c687e]',
  },
};

const longFeatures = ['شرح 3 أشهر', '12 محاضرة', 'اختبارات وتدريبات', 'متابعة ودعم 3 أشهر'];
const shortFeatures = ['شرح شهر', '4 محاضرات', 'اختبارات وتدريبات', 'متابعة ودعم شهر'];

function PlanCard({ plan }: { plan: Plan }) {
  const colors = colorClasses[plan.color];
  const features = plan.period === '3 أشهر' ? longFeatures : shortFeatures;

  return (
    <article className="relative flex min-h-[420px] flex-col overflow-hidden rounded-[1.35rem] border border-white/70 bg-white px-5 pb-5 pt-12 text-start shadow-[0_16px_36px_rgba(5,3,35,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(5,3,35,0.32)]">
      <span className={`absolute right-0 top-0 rounded-bl-2xl px-4 py-2 text-sm font-extrabold text-white ${colors.badge}`}>
        {plan.period}
      </span>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold text-primary">سنة {plan.grade}</p>
          <h3 className={`mt-1 text-3xl font-black ${colors.accent}`}>{plan.system}</h3>
        </div>
        <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-lg ${colors.icon}`}>
          {plan.system === 'عربي' ? <Sparkles className="h-8 w-8" aria-hidden="true" /> : <Globe2 className="h-8 w-8" aria-hidden="true" />}
        </span>
      </div>

      <ul className="mt-7 flex flex-1 flex-col gap-3 text-sm font-semibold leading-relaxed text-primary/85">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${colors.accent}`} strokeWidth={3} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center">
        <div className={`rounded-xl px-4 py-2 text-white shadow-md ${colors.button}`}>
          <span className="text-3xl font-black">{plan.price}</span>
          <span className="mr-2 text-sm font-bold">جنيه</span>
        </div>
        <Button as="link" to="/booking" variant="primary" size="md" className={`mt-2 w-full rounded-xl shadow-md ${colors.button}`}>
          الاشتراك
        </Button>
      </div>
    </article>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-[#0d0b37] py-16 text-white sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#5c31c8]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#2f55cf]/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#c7a5ff]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Allef
          </span>
          <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">الاشتراكات والباقات</h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">اختر الباقة المناسبة ليك وابدأ رحلتك نحو التفوق</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => <PlanCard key={`${plan.period}-${plan.grade}-${plan.system}`} plan={plan} />)}
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl divide-y divide-white/15 rounded-3xl border border-white/15 bg-white/[0.06] px-5 py-2 backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse sm:px-8">
          <div className="flex items-center justify-center gap-3 py-4 text-center text-sm font-bold text-white/90 sm:py-5">
            <PlaySquare className="h-7 w-7 text-[#c7a5ff]" aria-hidden="true" />
            <span>محاضرات مسجلة بجودة عالية</span>
          </div>
          <div className="flex items-center justify-center gap-3 py-4 text-center text-sm font-bold text-white/90 sm:py-5">
            <MessageCircle className="h-7 w-7 text-[#c7a5ff]" aria-hidden="true" />
            <span>دعم فني على مدار الساعة</span>
          </div>
          <div className="flex items-center justify-center gap-3 py-4 text-center text-sm font-bold text-white/90 sm:py-5">
            <Laptop className="h-7 w-7 text-[#c7a5ff]" aria-hidden="true" />
            <span>متاح على جميع الأجهزة</span>
          </div>
        </div>
      </div>
    </section>
  );
}
