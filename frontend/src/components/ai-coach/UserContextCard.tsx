'use client';

import { useChatStore } from '@/store/chat-store';
import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Flame, Trophy } from 'lucide-react';

export default function UserContextCard() {
  const { userContext } = useChatStore();
  
  if (!userContext) return null;
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 text-sm">Coach knows about you:</h3>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Goal</p>
            <p className="font-medium capitalize">
              {userContext.fitness_goal?.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="font-medium">{userContext.level}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <div>
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="font-medium">{userContext.current_streak} days</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <div>
            <p className="text-xs text-muted-foreground">Workouts</p>
            <p className="font-medium">{userContext.total_workouts}</p>
          </div>
        </div>
      </div>
      
      {userContext.favorite_muscle_groups && userContext.favorite_muscle_groups.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-1">Favorite Muscles</p>
          <div className="flex flex-wrap gap-1">
            {userContext.favorite_muscle_groups.map((muscle, index) => (
              <span
                key={index}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
