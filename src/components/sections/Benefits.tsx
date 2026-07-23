import { SectionHeading } from '../ui/SectionHeading';
import { benefits } from '../../data/benefits';

export function Benefits() {
  return (
    <section id="benefits" className="bg-soft py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="مميزات Allef"
          title="ليه تختار Allef؟"
          description="مميزات مصمّمة لتناسب طالب البكالوريا وتساعده على فهم المادة بثقة."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="group flex flex-col items-start gap-4 rounded-4xl bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white transition-transform group-hover:scale-110">
                <b.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-primary">{b.title}</h3>
                {b.isFuture && (
                  <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-accent-dark">
                    قريبًا
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted">{b.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
