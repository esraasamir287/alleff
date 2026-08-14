import { supabase } from './supabaseClient';

export type SubscriptionRequestStatus = 'pending' | 'approved' | 'rejected';

export interface StudentSubscriptionRequest {
  id: string;
  userId: string;
  packageName: string;
  price: number;
  receiptPath: string;
  status: SubscriptionRequestStatus;
  createdAt: string;
}

export interface StudentPackageDetails {
  name: string;
  grade: string;
  track: string;
  duration: '3 أشهر' | 'شهر واحد';
  price: number;
  features: string[];
}

const LONG_FEATURES = ['شرح 3 أشهر', '12 محاضرة', 'اختبارات وتدريبات', 'متابعة ودعم 3 أشهر'];
const SHORT_FEATURES = ['شرح شهر', '4 محاضرات', 'اختبارات وتدريبات', 'متابعة ودعم شهر'];

function rowToSubscription(row: Record<string, unknown>): StudentSubscriptionRequest {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    packageName: row.package_name as string,
    price: row.price as number,
    receiptPath: row.receipt_path as string,
    status: row.status as SubscriptionRequestStatus,
    createdAt: row.created_at as string,
  };
}

export async function fetchLatestSubscriptionRequest(
  userId: string,
): Promise<StudentSubscriptionRequest | null> {
  const { data, error } = await supabase
    .from('subscription_requests')
    .select('id, user_id, package_name, price, receipt_path, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToSubscription(data as Record<string, unknown>) : null;
}

export function isDashboardEligible(request: StudentSubscriptionRequest | null): boolean {
  return Boolean(
    request?.receiptPath.trim() &&
      (request.status === 'pending' || request.status === 'approved'),
  );
}

export function getPackageDetails(request: StudentSubscriptionRequest): StudentPackageDetails {
  const duration = request.packageName.includes('3 أشهر') ? '3 أشهر' : 'شهر واحد';
  const grade = request.packageName.includes('أولى') ? 'الأولى' : 'الثانية';
  const track = request.packageName.includes('عربي') ? 'عربي' : 'لغات';

  return {
    name: request.packageName,
    grade,
    track,
    duration,
    price: request.price,
    features: duration === '3 أشهر' ? LONG_FEATURES : SHORT_FEATURES,
  };
}
