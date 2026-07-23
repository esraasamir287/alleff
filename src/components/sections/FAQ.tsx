import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { faqs } from '../../data/faqs';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-soft py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="الأسئلة الشائعة"
          title="أسئلة قد تدور في ذهنك"
          description="جمعنا لك أكثر الأسئلة شيوعًا حول المنصة وكيفية الاستفادة منها."
        />

        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-3xl border border-secondary-100 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-soft"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-primary">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-secondary transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
