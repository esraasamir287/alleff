import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, GraduationCap, PlayCircle, Youtube } from 'lucide-react';
import { Button } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';

const EMBED_SRC = 'https://www.youtube-nocookie.com/embed/VNcpZSEvs3o';
const WATCH_URL = 'https://youtu.be/VNcpZSEvs3o';
const POSTER_IMAGE = 'https://i.ytimg.com/vi/VNcpZSEvs3o/maxresdefault.jpg';

const FALLBACK_TIMEOUT_MS = 4000;

export function CourseVideo() {
  const loadedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, FALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    loadedRef.current = true;
  };

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
                  src={EMBED_SRC}
                  width="100%"
                  height="100%"
                  title="الكورس التأسيسي - الدرس الأول"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                />

                {failed && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-primary bg-cover bg-center text-center"
                    style={{ backgroundImage: `linear-gradient(rgba(18,18,74,0.72), rgba(18,18,74,0.88)), url(${POSTER_IMAGE})` }}
                    role="dialog"
                    aria-label="تعذّر تحميل الفيديو داخل المعاينة"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary shadow-soft-lg">
                      <PlayCircle className="h-8 w-8" aria-hidden="true" />
                    </span>
                    <p className="px-6 max-w-sm text-sm font-medium leading-relaxed text-white/90">
                      تعذّر عرض الفيديو داخل نافذة المعاينة. يمكنك مشاهدته مباشرة على يوتيوب.
                    </p>
                    <Button
                      as="a"
                      href={WATCH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="accent"
                      size="md"
                    >
                      <Youtube className="h-5 w-5" aria-hidden="true" />
                      افتح الفيديو على يوتيوب
                    </Button>
                  </div>
                )}
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
