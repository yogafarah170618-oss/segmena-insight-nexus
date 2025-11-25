import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string;
}

export const AchievementBadge = ({
  name,
  description,
  icon,
  unlocked,
  unlockedAt,
}: AchievementBadgeProps) => {
  return (
    <Card
      className={cn(
        'glass-card p-4 transition-all duration-300',
        unlocked ? 'hover:glow-effect' : 'opacity-50'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            unlocked ? 'bg-gradient-primary' : 'bg-muted'
          )}
        >
          {unlocked ? (
            icon || <Award className="w-6 h-6" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{name}</h4>
            {unlocked && (
              <Badge variant="secondary" className="text-xs">
                Unlocked
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(unlockedAt).toLocaleDateString('id-ID')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
