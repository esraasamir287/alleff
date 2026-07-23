import { supabase } from './supabaseClient';

export type ClassTime = '09:00' | '11:00';
export type AttendanceMode = 'online' | 'offline';

export interface Booking {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  studySystem: string | null;
  wantsOnline: boolean;
  classDay: string | null;
  classTime: ClassTime | null;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingChoice {
  mode: AttendanceMode;
  classTime: ClassTime | null;
}

function rowToBooking(data: Record<string, unknown>): Booking {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    fullName: data.full_name as string,
    email: data.email as string,
    phone: data.phone as string,
    studySystem: (data.study_system as string | null) ?? null,
    wantsOnline: data.wants_online as boolean,
    classDay: (data.class_day as string | null) ?? null,
    classTime: (data.class_time as ClassTime | null) ?? null,
    subscriptionStatus: data.subscription_status as string,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function fetchBooking(
  userId: string,
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      'id, user_id, full_name, email, phone, study_system, wants_online, class_day, class_time, subscription_status, created_at, updated_at',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToBooking(data as Record<string, unknown>);
}

export async function saveBooking(
  profile: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    studySystem: string | null;
  },
  choice: BookingChoice,
): Promise<Booking> {
  const wantsOnline = choice.mode === 'online';
  const status = wantsOnline ? 'subscribed' : 'not_subscribed';

  const payload = {
    user_id: profile.userId,
    full_name: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    study_system: profile.studySystem,
    wants_online: wantsOnline,
    class_day: wantsOnline ? 'thursday' : null,
    class_time: wantsOnline ? choice.classTime : null,
    subscription_status: status,
    submission_origin: 'account',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(payload, { onConflict: 'user_id' })
    .select(
      'id, user_id, full_name, email, phone, study_system, wants_online, class_day, class_time, subscription_status, created_at, updated_at',
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('SAVE_FAILED');
  return rowToBooking(data as Record<string, unknown>);
}
