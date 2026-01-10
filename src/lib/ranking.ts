import { supabase } from './supabase';

// Points mapping for each contact method
export const CONTACT_POINTS = {
  call: 6,
  email: 3,
  linkedin: 4,
  outing: 10,
} as const;

export type ContactMethod = keyof typeof CONTACT_POINTS;

/**
 * Calculate points for a single contact method
 */
export function getContactPoints(contactMethod: ContactMethod | null): number {
  if (!contactMethod) return 0;
  return CONTACT_POINTS[contactMethod] || 0;
}

/**
 * Fetch user rankings with detailed statistics
 */
export async function getUserRankings() {
  // @ts-ignore - user_rankings is a view defined in SQL
  const { data, error } = await supabase
    .from('user_rankings')
    .select('*')
    .order('rank', { ascending: true });

  if (error) {
    console.error('Error fetching user rankings:', error);
    throw error;
  }

  return data;
}

/**
 * Get ranking for a specific user
 */
export async function getUserRanking(userId: string) {
  // @ts-ignore - user_rankings is a view defined in SQL
  const { data, error } = await supabase
    .from('user_rankings')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user ranking:', error);
    throw error;
  }

  return data;
}

/**
 * Get ranking by rank position
 */
export async function getUserByRank(rankPosition: number) {
  // @ts-ignore - user_rankings is a view defined in SQL
  const { data, error } = await supabase
    .from('user_rankings')
    .select('*')
    .eq('rank', rankPosition)
    .single();

  if (error) {
    console.error('Error fetching user by rank:', error);
    throw error;
  }

  return data;
}

/**
 * Get top N users by points
 */
export async function getTopUsers(limit: number = 10) {
  // @ts-ignore - user_rankings is a view defined in SQL
  const { data, error } = await supabase
    .from('user_rankings')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top users:', error);
    throw error;
  }

  return data;
}

/**
 * Get user activities with points
 */
export async function getUserActivities(userId: string) {
  // @ts-ignore - activities table is defined in database
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }

  return (data || []).map((activity: any) => ({
    ...activity,
    points: getContactPoints(activity.contact_method),
  }));
}

/**
 * Add activity for a user (automatically updates ranking via trigger)
 */
export async function addActivity(
  userId: string,
  source: 'company' | 'logistics',
  sourceId: number,
  contactMethod: ContactMethod
) {
  // @ts-ignore - activities table is defined in database
  const { data, error } = await supabase
    .from('activities')
    // @ts-ignore
    .insert({
      user_id: userId,
      source,
      source_id: sourceId,
      contact_method: contactMethod,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding activity:', error);
    throw error;
  }

  return data;
}

/**
 * Get ranking statistics for a user
 */
export async function getUserRankingStats(userId: string) {
  // @ts-ignore - user_rankings is a view defined in SQL
  const { data, error } = await supabase
    .from('user_rankings')
    .select(
      'id, full_name, email, team, total_points, total_activities, call_count, email_count, linkedin_count, outing_count, rank'
    )
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user ranking stats:', error);
    throw error;
  }

  if (!data) {
    throw new Error('User ranking not found');
  }

  const typedData = data as any;
  return {
    ...typedData,
    breakdown: {
      calls: { count: typedData.call_count || 0, points: (typedData.call_count || 0) * CONTACT_POINTS.call },
      emails: { count: typedData.email_count || 0, points: (typedData.email_count || 0) * CONTACT_POINTS.email },
      linkedin: { count: typedData.linkedin_count || 0, points: (typedData.linkedin_count || 0) * CONTACT_POINTS.linkedin },
      outings: { count: typedData.outing_count || 0, points: (typedData.outing_count || 0) * CONTACT_POINTS.outing },
    },
  };
}
