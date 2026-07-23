import type { LucideIcon } from 'lucide-react';
import { UserPlus, LogIn, LayoutGrid, PlayCircle, PenTool, TrendingUp } from 'lucide-react';

export interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    icon: UserPlus,
    title: 'إنشاء حساب',
    description: 'يبدأ الطالب بإنشاء حسابه على Allef بسهولة.',
  },
  {
    icon: LogIn,
    title: 'الدخول إلى المنصة',
    description: 'بعد إنشاء الحساب، يدخل الطالب إلى لوحته التعليمية على Allef.',
  },
  {
    icon: LayoutGrid,
    title: 'اختيار المحتوى التعليمي',
    description: 'يختار الطالب المحتوى الذي يريد دراسته.',
  },
  {
    icon: PlayCircle,
    title: 'مشاهدة الشرح',
    description: 'يشاهد الطالب الشرح المبسّط للدرس.',
  },
  {
    icon: PenTool,
    title: 'حل التدريبات والاختبارات',
    description: 'يطبّق الطالب ما تعلّمه عبر التدريبات والاختبارات.',
  },
  {
    icon: TrendingUp,
    title: 'متابعة النتائج والتقدم',
    description: 'يطلع الطالب على نتائجه ويتابع تقدّمه على Allef خطوة بخطوة.',
  },
];
