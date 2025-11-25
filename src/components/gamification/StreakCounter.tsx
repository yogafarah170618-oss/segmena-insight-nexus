import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCounter = ({ currentStreak, longestStreak }: StreakCounterProps) => {
  return (
    <Card className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">{currentStreak} Days</div>
          <div className="text-xs text-muted-foreground">
            Active Streak • Best: {longestStreak} days
          </div>
        </div>
      </div>
    </Card>
  );
};
