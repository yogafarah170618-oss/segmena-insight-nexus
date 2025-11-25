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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!gamification) return null;

  return (
    <div className="space-y-6">
      {/* Level & Points Card */}
      <Card className="glass-card-strong p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Your Progress</div>
            <div className="text-3xl font-bold mb-1">Level {gamification.level}</div>
            <div className="text-sm text-muted-foreground">
              {gamification.totalPoints} points earned
            </div>
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
            <Trophy className="w-10 h-10" />
          </div>
        </div>
      </Card>

      {/* Streak Counter */}
      {gamification.currentStreak > 0 && (
        <StreakCounter
          currentStreak={gamification.currentStreak}
          longestStreak={gamification.longestStreak}
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
          {missions.map((mission) => (
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
            current={gamification.segmentsExplored}
            target={5}
            label="Segments Explored"
            icon={<Target className="w-4 h-4 text-primary" />}
          />
          <ProgressBar
            current={gamification.segmentsCompared}
            target={2}
            label="Segments Compared"
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
          />
          <ProgressBar
            current={gamification.visualizationsUsed}
            target={3}
            label="Visualizations Used"
            icon={<BarChart className="w-4 h-4 text-primary" />}
          />
          <ProgressBar
            current={gamification.filtersApplied}
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
