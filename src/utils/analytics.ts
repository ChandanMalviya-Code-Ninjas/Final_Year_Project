import { supabase } from "@/integrations/supabase/client";

export interface ActivityLog {
  type: string;
  time: string;
  status: string;
  path?: string;
  details?: any;
  id?: string;
}

export interface DashboardStats {
  healthScore: number;
  symptomsChecked: number;
  chatInteractions: number;
  dietPlans: number;
  hospitalsSearched: number;
  medicationAdherence: number;
  diseasePredictions: number;
  medicineRecommendations: number;
  medicationsTaken: number;
}

export interface WeeklyActivityPoint {
  day: string;
  activities: number;
  date: string;
}

export interface ModuleUsage {
  name: string;
  count: number;
  color: string;
}

// Helper to get user-specific storage key
const getStorageKey = (userId: string, key: string) => `analytics_${userId}_${key}`;

export const logActivity = async (userId: string, type: string, path: string, status: string = "Completed", details?: any) => {
  if (!userId) return;

  try {
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      type,
      path,
      status,
      details
    });
  } catch (error) {
    console.error("Error logging activity to Supabase:", error);
  }
};

export const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
  const defaultStats: DashboardStats = {
    healthScore: 60,
    symptomsChecked: 0,
    chatInteractions: 0,
    dietPlans: 0,
    hospitalsSearched: 0,
    medicationAdherence: 0,
    diseasePredictions: 0,
    medicineRecommendations: 0,
    medicationsTaken: 0
  };

  if (!userId) return defaultStats;

  try {
    const { data: logs, error } = await supabase
      .from('user_activity_logs')
      .select('type')
      .eq('user_id', userId);

    if (error) throw error;
    const typedLogs = (logs ?? []) as { type: string }[];

    let symptomsChecked = 0;
    let chatInteractions = 0;
    let dietPlans = 0;
    let hospitalsSearched = 0;
    let diseasePredictions = 0;
    let medicineRecommendations = 0;
    let medicationsTaken = 0;
    let medicationAdded = 0;

    typedLogs.forEach(log => {
      if (log.type === 'Symptom Check') symptomsChecked++;
      if (log.type === 'Health Chat') chatInteractions++;
      if (log.type === 'Diet Plan Created') dietPlans++;
      if (log.type === 'Hospital Search') hospitalsSearched++;
      if (log.type === 'Disease Predictor') diseasePredictions++;
      if (log.type === 'Medicine Recommender') medicineRecommendations++;
      if (log.type === 'Medication Taken') medicationsTaken++;
      if (log.type === 'Medication Added') medicationAdded++;
    });

    // Fetch medication adherence from medication_logs
    let medicationAdherence = 0;
    try {
      const { data: medLogs } = await supabase
        .from('medication_logs')
        .select('taken')
        .eq('user_id', userId);

      const typedMedLogs = (medLogs ?? []) as { taken: boolean }[];
      if (typedMedLogs.length > 0) {
        const takenCount = typedMedLogs.filter(m => m.taken).length;
        medicationAdherence = Math.round((takenCount / typedMedLogs.length) * 100);
      } else if (medicationAdded > 0) {
        medicationAdherence = 75; // Estimate if added but no logs yet
      }
    } catch (e) {
      // medication_logs may not exist yet
    }

    // Dynamic health score algorithm based on engagement across all modules
    const totalModulesUsed = [
      symptomsChecked > 0,
      chatInteractions > 0,
      dietPlans > 0,
      hospitalsSearched > 0,
      diseasePredictions > 0,
      medicineRecommendations > 0,
      medicationAdded > 0
    ].filter(Boolean).length;

    const engagementScore = Math.min(30, totalModulesUsed * 4);
    const activityScore = Math.min(40, (symptomsChecked * 3) + (chatInteractions * 2) + (dietPlans * 5) + (diseasePredictions * 4) + (medicineRecommendations * 3));
    const adherenceScore = Math.round(medicationAdherence * 0.3);

    const score = Math.min(100, 30 + engagementScore + activityScore + adherenceScore);

    return {
      healthScore: score,
      symptomsChecked,
      chatInteractions,
      dietPlans,
      hospitalsSearched,
      medicationAdherence,
      diseasePredictions,
      medicineRecommendations,
      medicationsTaken
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return defaultStats;
  }
};

export const getRecentActivity = async (userId: string, limit: number = 6): Promise<ActivityLog[]> => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const typedLogs = (data ?? []) as { id: string; type: string; created_at: string; status: string; path: string | null; details: any }[];
    return typedLogs.map(log => ({
      id: log.id,
      type: log.type,
      time: log.created_at,
      status: log.status,
      path: log.path || undefined,
      details: log.details
    }));
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
};

export const fetchWeeklyActivity = async (userId: string): Promise<WeeklyActivityPoint[]> => {
  if (!userId) return [];

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    const typedData = (data ?? []) as { created_at: string }[];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: WeeklyActivityPoint[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = days[d.getDay()];
      const dateStr = d.toDateString();

      const count = typedData.filter(log => {
        return new Date(log.created_at).toDateString() === dateStr;
      }).length || 0;

      result.push({
        day: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : dayStr,
        activities: count,
        date: dateStr
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching weekly activity:", error);
    return [];
  }
};

export const fetchModuleBreakdown = async (userId: string): Promise<ModuleUsage[]> => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('type')
      .eq('user_id', userId);

    if (error) throw error;
    const typedData = (data ?? []) as { type: string }[];

    const moduleColors: Record<string, string> = {
      'Symptom Check': '#3b82f6',
      'Health Chat': '#8b5cf6',
      'Diet Plan Created': '#f97316',
      'Hospital Search': '#ef4444',
      'Disease Predictor': '#ec4899',
      'Medicine Recommender': '#10b981',
      'Medication Added': '#6366f1',
      'Medication Taken': '#06b6d4',
      'Profile Updated': '#64748b',
    };

    const moduleLabels: Record<string, string> = {
      'Symptom Check': 'Symptom Checker',
      'Health Chat': 'Health Chat',
      'Diet Plan Created': 'Diet Planner',
      'Hospital Search': 'Hospital Finder',
      'Disease Predictor': 'Disease Predictor',
      'Medicine Recommender': 'Medicine Rec.',
      'Medication Added': 'Medication',
      'Medication Taken': 'Med. Taken',
      'Profile Updated': 'Profile',
    };

    const countMap: Record<string, number> = {};
    typedData.forEach(log => {
      countMap[log.type] = (countMap[log.type] || 0) + 1;
    });

    return Object.entries(countMap)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        name: moduleLabels[type] || type,
        count,
        color: moduleColors[type] || '#94a3b8'
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching module breakdown:", error);
    return [];
  }
};

export const deleteActivityLog = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('user_activity_logs').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    return false;
  }
};

export const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 172800) return "Yesterday";

  const days = Math.floor(diffInSeconds / 86400);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};
