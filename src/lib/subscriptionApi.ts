import { supabase } from './supabaseClient';

export type ClassDay = 'thursday' | 'sunday';
export type SubscriptionStatus = 'subscribed' | 'not_subscribed';
export type StudySystemValue = 'arabic' | 'languages';

export interface Subscription {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string;
  studySystem: StudySystemValue | null;
  wantsOnline: boolean;
  classDay: ClassDay | null;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionChoice {
  wantsOnline: boolean;
  classDay: ClassDay | null;
}

export interface SubscriberProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  studySystem: StudySystemValue | null;
}

export interface PublicSubscriptionPayload {
  fullName: string;
  email: string;
  phone: string;
  studySystem?: StudySystemValue | null;
  wantsOnline: boolean;
  classDay: ClassDay | null;
}

export interface PublicSubscriptionResult {
  success: boolean;
  message: string;
  fieldErrors?: {
    fullName?: string;
    email?: string;
    phone?: string;
    studySystem?: string;
    classDay?: string;
  };
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function rowToSubscription(data: Record<string, unknown>): Subscription {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    fullName: data.full_name as string,
    email: data.email as string,
    phone: data.phone as string,
    studySystem: (data.study_system as StudySystemValue | null) ?? null,
    wantsOnline: data.wants_online as boolean,
    classDay: (data.class_day as ClassDay | null) ?? null,
    subscriptionStatus: data.subscription_status as SubscriptionStatus,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function fetchSubscription(
  userId: string,
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      'id, user_id, full_name, email, phone, study_system, wants_online, class_day, subscription_status, created_at, updated_at',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToSubscription(data as Record<string, unknown>);
}

export async function saveSubscription(
  profile: SubscriberProfile,
  choice: SubscriptionChoice,
): Promise<Subscription> {
  const status: SubscriptionStatus = choice.wantsOnline
    ? 'subscribed'
    : 'not_subscribed';

  const payload = {
    user_id: profile.userId,
    full_name: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    study_system: profile.studySystem,
    wants_online: choice.wantsOnline,
    class_day: choice.classDay,
    subscription_status: status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(payload, { onConflict: 'user_id' })
    .select(
      'id, user_id, full_name, email, phone, study_system, wants_online, class_day, subscription_status, created_at, updated_at',
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('SAVE_FAILED');
  return rowToSubscription(data as Record<string, unknown>);
}

export async function submitPublicSubscription(
  payload: PublicSubscriptionPayload,
): Promise<PublicSubscriptionResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/subscription-submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    /* malformed body */
  }

  if (!response.ok) {
    const err = data as { message?: string; errors?: PublicSubscriptionResult['fieldErrors'] };
    return {
      success: false,
      message: err?.message ?? 'تعذر حفظ اختيارك حاليًا. يرجى المحاولة مرة أخرى.',
      fieldErrors: err?.errors,
    };
  }

  return data as PublicSubscriptionResult;
}
