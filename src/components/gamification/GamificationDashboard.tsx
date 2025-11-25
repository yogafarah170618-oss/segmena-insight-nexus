import { useGamification } from '@/contexts/GamificationContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressBar } from './ProgressBar';
import { AchievementBadge } from './AchievementBadge';
import { MissionCard } from './MissionCard';
import { StreakCounter } from './StreakCounter';
import { Target, Trophy, Zap, TrendingUp, Filter, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ACHIEVEMENT_DEFINITIONS = [
  {
    key: 'data_explorer',
    name: 'Data Explorer',
    description: 'Explored 5 different customer segments',
    icon: <Target className="w-6 h-6" />,
    requirement: (gam: any) => gam?.segmentsExplored >= 5,
  },
  {
    key: 'insight_crafter',
    name: 'Insight Crafter',
    description: 'Created your first insight report',
    icon: <Zap className="w-6 h-6" />,
    requirement: (gam: any) => gam?.insightsCreated >= 1,
  },
  {
    key: 'trend_spotter',
    name: 'Trend Spotter',
    description: 'Used 3 different visualization types',
    icon: <BarChart className="w-6 h-6" />,
    requirement: (gam: any) => gam?.visualizationsUsed >= 3,
  },
  {
    key: 'retention_analyst',
    name: 'Retention Analyst',
    description: 'Compared 2 segments to find patterns',
    icon: <TrendingUp className="w-6 h-6" />,
    requirement: (gam: any) => gam?.segmentsCompared >= 2,
  },
];

export const GamificationDashboard = () => {
  const { gamification, achievements, missions, loading } = useGamification();

  // Demo data for preview when not logged in
  const demoGamification = {
    totalPoints: 850,
    level: 3,
    segmentsExplored: 4,
    insightsCreated: 2,
    segmentsCompared: 1,
    visualizationsUsed: 3,
    filtersApplied: 5,
    currentStreak: 3,
    longestStreak: 7,
  };

  const demoMissions = [
    { key: 'analyze_first_segment', name: 'Analyze First Segment', description: 'Explore your first customer segment', isCompleted: true },
    { key: 'compare_segments', name: 'Compare Two Segments', description: 'Compare different customer groups', isCompleted: false },
    { key: 'save_first_insight', name: 'Save First Insight', description: 'Create and save your first insight report', isCompleted: false },
    { key: 'apply_first_filter', name: 'Apply Your First Filter', description: 'Use filters to refine your data', isCompleted: false },
  ];

  const currentGamification = gamification || demoGamification;
  const currentMissions = missions.length > 0 ? missions : demoMissions;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const activeMissions = currentMissions.filter((m) => !m.isCompleted);
  const completedMissions = currentMissions.filter((m) => m.isCompleted);

  return (
    <div className="space-y-6">
      {/* Level & Points Card */}
      <Card className="glass-card-strong p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Your Progress</div>
            <div className="text-3xl font-bold mb-1">Level {currentGamification.level}</div>
            <div className="text-sm text-muted-foreground">
              {currentGamification.totalPoints} points earned
            </div>
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
            <Trophy className="w-10 h-10" />
          </div>
        </div>
      </Card>

      {/* Streak Counter */}
      {currentGamification.currentStreak > 0 && (
        <StreakCounter
          currentStreak={currentGamification.currentStreak}
          longestStreak={currentGamification.longestStreak}
        />
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-4 mt-4">
          {currentMissions.map((mission) => (
            <MissionCard
              key={mission.key}
              name={mission.name}
              description={mission.description}
              isCompleted={mission.isCompleted}
            />
          ))}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 mt-4">
          <ProgressBar
            current={currentGamification.segmentsExplored}
            target={5}
            label="Segments Explored"
            icon={<Target className="w-4 h-4 text-primary" />}
          />
          <ProgressBar
            current={currentGamification.segmentsCompared}
            target={2}
            label="Segments Compared"
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
          />
          <ProgressBar
            current={currentGamification.visualizationsUsed}
            target={3}
            label="Visualizations Used"
            icon={<BarChart className="w-4 h-4 text-primary" />}
          />
          <ProgressBar
            current={currentGamification.filtersApplied}
            target={1}
            label="Filters Applied"
            icon={<Filter className="w-4 h-4 text-primary" />}
          />
        </TabsContent>

        <TabsContent value="achievements" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
            const isUnlocked = achievements.find((a) => a.key === achievement.key);
            return (
              <AchievementBadge
                key={achievement.key}
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                unlocked={!!isUnlocked}
                unlockedAt={isUnlocked?.unlockedAt}
              />
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};
