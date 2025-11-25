import { useState } from 'react';
import { useGamification } from '@/contexts/GamificationContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronDown, ChevronUp, Target, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const GamificationWidget = () => {
  const { gamification, missions } = useGamification();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!gamification) return null;

  const activeMissions = missions.filter(m => !m.isCompleted);
  const completedMissions = missions.filter(m => m.isCompleted);
  const overallProgress = (completedMissions.length / missions.length) * 100;

  return (
    <Card className={cn(
      "glass-card-strong transition-all duration-300",
      isExpanded ? "p-6" : "p-4"
    )}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Your Progress</div>
            <div className="text-xl font-bold">Level {gamification.level}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">
            {gamification.totalPoints} pts
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-4 animate-fade-in">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedMissions.length}/{missions.length} missions
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Active Missions */}
          {activeMissions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Active Missions
              </h4>
              <div className="space-y-2">
                {activeMissions.slice(0, 3).map((mission) => (
                  <div key={mission.key} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{mission.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{mission.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gamification.segmentsExplored}</div>
              <div className="text-xs text-muted-foreground">Segments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gamification.visualizationsUsed}</div>
              <div className="text-xs text-muted-foreground">Charts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completedMissions.length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
