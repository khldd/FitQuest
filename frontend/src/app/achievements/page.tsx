'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Lock, Flame, Star, Zap, Clock, Filter } from 'lucide-react';
import { useAchievements, useAchievementFilters, Achievement } from '@/lib/hooks';
import { AsyncDataWrapper, SkeletonList, SkeletonStats } from '@/components/ui/async-data-wrapper';

const TIER_COLORS = {
  bronze: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  silver: 'bg-gray-400/20 text-gray-300 border-gray-400/50',
  gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  platinum: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
};

const CATEGORY_ICONS = {
  consistency: Trophy,
  streak: Flame,
  variety: Star,
  intensity: Zap,
  duration: Clock,
};

export default function AchievementsPage() {
  const {
    achievements,
    isLoading,
    error,
    refetch,
    unlockedCount,
    totalPoints,
    completionPercentage,
  } = useAchievements();

  const {
    filteredAchievements,
    categoryFilter,
    setCategoryFilter,
    tierFilter,
    setTierFilter,
  } = useAchievementFilters(achievements);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          Achievements
        </h1>
        <p className="text-muted-foreground">
          Track your fitness journey milestones
        </p>
      </div>

      <AsyncDataWrapper
        data={achievements}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        skeleton={
          <div className="space-y-6">
            <SkeletonStats count={3} />
            <SkeletonList count={6} />
          </div>
        }
        isEmpty={(data) => data.length === 0}
        emptyComponent={
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl font-medium mb-2">No achievements yet</p>
            <p className="text-muted-foreground">
              Start working out to earn your first badge!
            </p>
          </Card>
        }
      >
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unlocked</p>
                <p className="text-2xl font-bold">
                  {unlockedCount} / {achievements.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints} XP</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{completionPercentage}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
              >
                All
              </Button>
              <Button
                variant={categoryFilter === 'consistency' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('consistency')}
              >
                Consistency
              </Button>
              <Button
                variant={categoryFilter === 'streak' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('streak')}
              >
                Streak
              </Button>
              <Button
                variant={categoryFilter === 'intensity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('intensity')}
              >
                Intensity
              </Button>
              <Button
                variant={categoryFilter === 'duration' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('duration')}
              >
                Duration
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex flex-wrap gap-2">
              <Button
                variant={tierFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTierFilter('all')}
              >
                All Tiers
              </Button>
              <Button
                variant={tierFilter === 'bronze' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTierFilter('bronze')}
              >
                Bronze
              </Button>
              <Button
                variant={tierFilter === 'silver' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTierFilter('silver')}
              >
                Silver
              </Button>
              <Button
                variant={tierFilter === 'gold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTierFilter('gold')}
              >
                Gold
              </Button>
              <Button
                variant={tierFilter === 'platinum' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTierFilter('platinum')}
              >
                Platinum
              </Button>
            </div>
          </div>
        </Card>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>

        {filteredAchievements.length === 0 && achievements.length > 0 && (
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No achievements match your filters
            </p>
          </Card>
        )}
      </AsyncDataWrapper>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const CategoryIcon = CATEGORY_ICONS[achievement.category as keyof typeof CATEGORY_ICONS] || Trophy;
  const tierColor = TIER_COLORS[achievement.tier as keyof typeof TIER_COLORS];

  return (
    <Card
      className={`p-6 relative overflow-hidden transition-all ${
        achievement.unlocked
          ? 'border-primary/50 bg-primary/5'
          : 'opacity-60 grayscale'
      }`}
    >
      {/* Tier Badge */}
      <Badge
        className={`absolute top-3 right-3 ${tierColor} capitalize`}
        variant="outline"
      >
        {achievement.tier}
      </Badge>

      {/* Icon */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`text-4xl ${
            achievement.unlocked ? '' : 'opacity-40'
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
            {achievement.name}
            {!achievement.unlocked && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground capitalize">
              {achievement.category}
            </span>
          </div>
          <span className="font-medium text-primary">
            +{achievement.points} XP
          </span>
        </div>

        {achievement.unlocked && achievement.unlocked_at && (
          <div className="text-xs text-muted-foreground">
            Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
          </div>
        )}

        {!achievement.unlocked && (
          <div className="text-xs text-muted-foreground">
            Requirement: {achievement.requirement_value}{' '}
            {achievement.requirement_type.replace('_', ' ')}
          </div>
        )}
      </div>
    </Card>
  );
}
