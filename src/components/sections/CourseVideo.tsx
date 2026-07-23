import { PlayCircle, GraduationCap, ArrowLeft } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

export function CourseVideo() {
  return (
    <section id="course-video" className="bg-soft py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="الكورس التأسيسي"
          title="ابدأ بالكورس التأسيسي قبل الامتحان"
          description="شاهد الدرس الأول من الكورس التأسيسي، ثم أكمل باقي فيديوهات القائمة على قناتنا قبل دخول الامتحان لضمان أفضل استيعاب وأعلى نتيجة."
        />

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-4xl border border-secondary-100 bg-white shadow-soft">
              <div className="relative aspect-video w-full bg-primary">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/VNcpZSEvs3o?rel=0&modestbranding=1"
                  title="الكورس التأسيسي - الدرس الأول"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-4 rounded-4xl border border-secondary-100 bg-white p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-700">
                <PlayCircle className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-extrabold text-primary">
                شاهد الكورس أولًا
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                هذا أول فيديو في قائمة الكورس التأسيسي على قناتنا. شاهد كامل
                القائمة قبل الدخول إلى الامتحان لتستعد جيدًا وتفهم كل المفاهيم
                المطلوبة.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 rounded-4xl border border-accent/30 bg-accent/10 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent-dark">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-extrabold text-primary">جاهز للامتحان؟</h3>
              <p className="text-sm leading-relaxed text-muted">
                بعد إكمال مشاهدة الكورس التأسيسي على قناتنا، ستكون مستعدًا لخوض
                الامتحان بثقة. لا تدخل الامتحان قبل المراجعة الكاملة.
              </p>
              <a
                href="https://youtu.be/VNcpZSEvs3o"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-secondary-700 transition-colors hover:text-secondary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                مشاهدة على يوتيوب
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
