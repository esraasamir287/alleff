import type { LucideIcon } from 'lucide-react';
import { BookOpen, Target, Laptop, ClipboardCheck, LineChart, Clock } from 'lucide-react';

export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  isFuture?: boolean;
}

export const benefits: Benefit[] = [
  {
    icon: BookOpen,
    title: 'شرح مبسط وواضح',
    description: 'نشرح المفاهيم بطريقة بسيطة ومناسبة لمستوى طالب البكالوريا، بعيدًا عن التعقيد.',
  },
  {
    icon: Target,
    title: 'محتوى مخصص لطلبة البكالوريا',
    description: 'كل المحتوى مصمم خصيصًا لطلبة البكالوريا في مادة البرمجة والذكاء الاصطناعي.',
  },
  {
    icon: Laptop,
    title: 'أسلوب تعليمي عملي',
    description: 'نعتمد على التطبيق العملي وأمثلة قابلة للفهم لتثبيت المعلومة.',
  },
  {
    icon: ClipboardCheck,
    title: 'تدريبات واختبارات مستقبلًا',
    description: 'متوفر بالفعل تدريبات واختبارات تساعد الطالب على قياس فهمه وتطبيق ما تعلّمه.',
    
  },
  {
    icon: LineChart,
    title: 'متابعة مستوى الطالب مستقبلًا',
    description: 'سيتمكن الطالب لاحقًا من متابعة نتائجه وتقدّمه التعليمي داخل Allef.',
    isFuture: true,
  },
  {
    icon: Clock,
    title: 'إمكانية التعلم في أي وقت',
    description: 'محتوى تعليمي متاح بحيث يستطيع الطالب التعلم وفق وقته الخاص.',
  },
];
