import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  icon?: React.ReactNode;
}

export const ProgressBar = ({ current, target, label, icon }: ProgressBarProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <Card className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon || <TrendingUp className="w-4 h-4 text-primary" />}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <Badge variant={isComplete ? "default" : "secondary"} className="text-xs">
          {current}/{target}
        </Badge>
      </div>
      <Progress value={percentage} className="h-2" />
      {isComplete && (
        <div className="mt-2 text-xs text-primary animate-fade-in">
          ✓ Completed!
        </div>
      )}
    </Card>
  );
};
