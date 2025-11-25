import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GamificationData {
  totalPoints: number;
  level: number;
  segmentsExplored: number;
  insightsCreated: number;
  segmentsCompared: number;
  visualizationsUsed: number;
  filtersApplied: number;
  currentStreak: number;
  longestStreak: number;
}

interface Achievement {
  key: string;
  name: string;
  description: string;
  unlockedAt: string;
}

interface Mission {
  key: string;
  name: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
}

interface GamificationContextType {
  gamification: GamificationData | null;
  achievements: Achievement[];
  missions: Mission[];
  loading: boolean;
  trackActivity: (type: string, data?: any) => Promise<void>;
  completeMission: (missionKey: string) => Promise<void>;
  unlockAchievement: (achievementKey: string, name: string, description: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadGamificationData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Load gamification data
      const { data: gamData } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (gamData) {
        setGamification({
          totalPoints: gamData.total_points,
          level: gamData.level,
          segmentsExplored: gamData.segments_explored,
          insightsCreated: gamData.insights_created,
          segmentsCompared: gamData.segments_compared,
          visualizationsUsed: gamData.visualizations_used,
          filtersApplied: gamData.filters_applied,
          currentStreak: gamData.current_streak,
          longestStreak: gamData.longest_streak,
        });
      }

      // Load achievements
      const { data: achievData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('unlocked_at', { ascending: false });

      if (achievData) {
        setAchievements(achievData.map(a => ({
          key: a.achievement_key,
          name: a.achievement_name,
          description: a.achievement_description || '',
          unlockedAt: a.unlocked_at,
        })));
      }

      // Load missions
      const { data: missionData } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (missionData) {
        setMissions(missionData.map(m => ({
          key: m.mission_key,
          name: m.mission_name,
          description: m.mission_description || '',
          isCompleted: m.is_completed,
          completedAt: m.completed_at || undefined,
        })));
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGamificationData();
  }, []);

  const trackActivity = async (type: string, data?: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from('user_activities').insert({
        user_id: session.user.id,
        activity_type: type,
        activity_data: data || {},
      });

      // Update gamification counters based on activity type
      const updates: any = {};
      let pointsEarned = 0;

      switch (type) {
        case 'segment_explored':
          updates.segments_explored = (gamification?.segmentsExplored || 0) + 1;
          pointsEarned = 10;
          break;
        case 'insight_created':
          updates.insights_created = (gamification?.insightsCreated || 0) + 1;
          pointsEarned = 25;
          break;
        case 'segments_compared':
          updates.segments_compared = (gamification?.segmentsCompared || 0) + 1;
          pointsEarned = 20;
          break;
        case 'visualization_used':
          updates.visualizations_used = (gamification?.visualizationsUsed || 0) + 1;
          pointsEarned = 5;
          break;
        case 'filter_applied':
          updates.filters_applied = (gamification?.filtersApplied || 0) + 1;
          pointsEarned = 5;
          break;
      }

      if (Object.keys(updates).length > 0) {
        updates.total_points = (gamification?.totalPoints || 0) + pointsEarned;
        
        await supabase
          .from('user_gamification')
          .update(updates)
          .eq('user_id', session.user.id);

        await loadGamificationData();
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const completeMission = async (missionKey: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const mission = missions.find(m => m.key === missionKey);
      if (!mission || mission.isCompleted) return;

      await supabase
        .from('user_missions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id)
        .eq('mission_key', missionKey);

      // Award points for completing mission
      await supabase
        .from('user_gamification')
        .update({
          total_points: (gamification?.totalPoints || 0) + 50,
        })
        .eq('user_id', session.user.id);

      toast({
        title: '🎉 Mission Completed!',
        description: mission.name,
      });

      await loadGamificationData();
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  const unlockAchievement = async (achievementKey: string, name: string, description: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if already unlocked
      const existing = achievements.find(a => a.key === achievementKey);
      if (existing) return;

      await supabase.from('user_achievements').insert({
        user_id: session.user.id,
        achievement_key: achievementKey,
        achievement_name: name,
        achievement_description: description,
      });

      toast({
        title: '🏆 Achievement Unlocked!',
        description: name,
      });

      await loadGamificationData();
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const refreshData = async () => {
    await loadGamificationData();
  };

  return (
    <GamificationContext.Provider
      value={{
        gamification,
        achievements,
        missions,
        loading,
        trackActivity,
        completeMission,
        unlockAchievement,
        refreshData,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};
