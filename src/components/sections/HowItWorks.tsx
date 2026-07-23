import { SectionHeading } from '../ui/SectionHeading';
import { steps } from '../../data/steps';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="كيف تعمل Allef"
          title="رحلة الطالب المستقبلية على Allef"
          description="هذا الشرح التوضيحي لرحلة الطالب المستقبلية، وهي ميزات قيد التطوير وستتوفر لاحقًا."
        />

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="relative flex flex-col items-start gap-4 rounded-4xl border border-secondary-100 bg-soft p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-base font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-secondary-700 shadow-soft">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-primary">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
