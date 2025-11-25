import { useEffect } from 'react';
import { useGamification } from '@/contexts/GamificationContext';

const ACHIEVEMENT_DEFINITIONS = [
  {
    key: 'data_explorer',
    name: 'Data Explorer',
    description: 'Explored 5 different customer segments',
    requirement: (gam: any) => gam?.segmentsExplored >= 5,
  },
  {
    key: 'insight_crafter',
    name: 'Insight Crafter',
    description: 'Created your first insight report',
    requirement: (gam: any) => gam?.insightsCreated >= 1,
  },
  {
    key: 'trend_spotter',
    name: 'Trend Spotter',
    description: 'Used 3 different visualization types',
    requirement: (gam: any) => gam?.visualizationsUsed >= 3,
  },
  {
    key: 'retention_analyst',
    name: 'Retention Analyst',
    description: 'Compared 2 segments to find patterns',
    requirement: (gam: any) => gam?.segmentsCompared >= 2,
  },
];

export const useGamificationTracking = () => {
  const { gamification, achievements, unlockAchievement } = useGamification();

  useEffect(() => {
    if (!gamification) return;

    // Check for new achievements
    ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
      const alreadyUnlocked = achievements.find((a) => a.key === achievement.key);
      if (!alreadyUnlocked && achievement.requirement(gamification)) {
        unlockAchievement(achievement.key, achievement.name, achievement.description);
      }
    });
  }, [gamification, achievements, unlockAchievement]);
};
