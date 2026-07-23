import { GraduationCap, Users, BookHeart } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

const points = [
  {
    icon: GraduationCap,
    title: 'ما هي Allef',
    description: 'Allef منصة تعليمية تشرح مادة البرمجة والذكاء الاصطناعي لطلبة البكالوريا بطريقة مبسّطة وواضحة.',
  },
  {
    icon: Users,
    title: 'لمن صُمّمت',
    description: 'موجّهة لطلبة البكالوريا المصريين وكذلك أولياء الأمور الذين يتابعون تعلّم أبنائهم.',
  },
  {
    icon: BookHeart,
    title: 'كيف تساعد',
    description: 'تركّز على التبسيط والفهم والتطبيق والمراجعة، لتأهيل الطالب للامتحان بثقة.',
  },
];

export function About() {
  return (
    <section id="about" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="عن Allef"
          title="Allef تبسّط البرمجة والذكاء الاصطناعي لطلبة البكالوريا"
          description="نهدف إلى جعل مادة البرمجة والذكاء الاصطناعي مفهومة وقريبة من كل طالب بكالوريا عربي أو لغات، عبر شرح مبسّط وتطبيق عملي."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {points.map((p) => (
            <article
              key={p.title}
              className="flex flex-col items-start gap-4 rounded-4xl border border-secondary-100 bg-soft p-6 transition-shadow hover:shadow-soft"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-700">
                <p.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-extrabold text-primary">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{p.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
