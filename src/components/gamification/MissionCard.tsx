import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionCardProps {
  name: string;
  description: string;
  isCompleted: boolean;
  onStart?: () => void;
  icon?: React.ReactNode;
}

export const MissionCard = ({
  name,
  description,
  isCompleted,
  onStart,
  icon,
}: MissionCardProps) => {
  return (
    <Card
      className={cn(
        'glass-card p-4 transition-all duration-300',
        isCompleted ? 'border-primary/50' : 'hover:border-primary/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            isCompleted ? 'bg-primary/20' : 'bg-muted'
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          ) : (
            icon || <Circle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{name}</h4>
            {isCompleted && (
              <Badge variant="default" className="text-xs">
                Done
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
          {!isCompleted && onStart && (
            <Button
              size="sm"
              variant="outline"
              onClick={onStart}
              className="text-xs h-7"
            >
              Start Mission
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
