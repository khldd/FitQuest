'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  Dumbbell,
  Filter,
  Search,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
  ChevronRight,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import {
  usePrograms,
  useFeaturedPrograms,
  useActiveEnrollment,
  DIFFICULTY_OPTIONS,
  GOAL_OPTIONS,
  getDifficultyColor,
  getGoalIcon,
  formatProgramDuration,
} from '@/lib/hooks';
import { AsyncDataWrapper, SkeletonList, SkeletonCard } from '@/components/ui/async-data-wrapper';
import type { WorkoutProgram, ProgramDifficulty, ProgramGoal } from '@/types/program';

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<ProgramDifficulty | 'all'>('all');
  const [goalFilter, setGoalFilter] = useState<ProgramGoal | 'all'>('all');

  const { programs: featuredPrograms, isLoading: featuredLoading } = useFeaturedPrograms();
  const { programs: allPrograms, isLoading: allLoading, error, refetch } = usePrograms({
    difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
    goal: goalFilter !== 'all' ? goalFilter : undefined,
    search: searchQuery || undefined,
  });
  const { enrollment: activeEnrollment, hasActiveEnrollment } = useActiveEnrollment();

  const isLoading = featuredLoading || allLoading;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Calendar className="h-10 w-10 text-primary" />
          Workout Programs
        </h1>
        <p className="text-muted-foreground">
          Structured training plans to achieve your fitness goals
        </p>
      </div>

      {/* Active Enrollment Banner */}
      {hasActiveEnrollment && activeEnrollment && (
        <Card className="mb-8 p-6 bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{activeEnrollment.program.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground">Currently Active</p>
                <h3 className="text-xl font-semibold">{activeEnrollment.program.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>Week {activeEnrollment.current_week} of {activeEnrollment.program.duration_weeks}</span>
                  <span>•</span>
                  <span>{activeEnrollment.completion_percentage}% complete</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/programs/${activeEnrollment.program.id}`}>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Program
                </Button>
              </Link>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${activeEnrollment.completion_percentage}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      <AsyncDataWrapper
        data={allPrograms}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        skeleton={
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        }
        isEmpty={(data) => data.length === 0 && featuredPrograms.length === 0}
        emptyComponent={
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl font-medium mb-2">No programs available</p>
            <p className="text-muted-foreground">
              Check back later for new training programs!
            </p>
          </Card>
        }
      >
        {/* Featured Programs */}
        {featuredPrograms.length > 0 && !searchQuery && difficultyFilter === 'all' && goalFilter === 'all' && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Programs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} featured />
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                <Button
                  variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyFilter('all')}
                >
                  All Levels
                </Button>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={difficultyFilter === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDifficultyFilter(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Goal Filter */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Goal:</span>
            <Button
              variant={goalFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGoalFilter('all')}
            >
              All Goals
            </Button>
            {GOAL_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={goalFilter === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGoalFilter(opt.value)}
              >
                {getGoalIcon(opt.value)} {opt.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* All Programs */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            {searchQuery || difficultyFilter !== 'all' || goalFilter !== 'all'
              ? `Results (${allPrograms.length})`
              : 'All Programs'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>

          {allPrograms.length === 0 && (searchQuery || difficultyFilter !== 'all' || goalFilter !== 'all') && (
            <Card className="p-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No programs match your filters. Try adjusting your search.
              </p>
            </Card>
          )}
        </section>
      </AsyncDataWrapper>
    </div>
  );
}

function ProgramCard({ program, featured = false }: { program: WorkoutProgram; featured?: boolean }) {
  return (
    <Link href={`/programs/${program.id}`}>
      <Card
        className={`p-6 h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer ${
          featured ? 'ring-2 ring-yellow-500/30 bg-yellow-500/5' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="text-4xl p-3 rounded-xl"
            style={{ backgroundColor: program.color + '20' }}
          >
            {program.icon}
          </div>
          <div className="flex flex-col items-end gap-1">
            {featured && (
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge className={getDifficultyColor(program.difficulty)}>
              {program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2">{program.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {program.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{program.duration_weeks} weeks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
            <span>{program.days_per_week} days/week</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{program.goal.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{program.enrolled_count} enrolled</span>
          </div>
        </div>

        {/* Equipment */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
          <Zap className="h-3 w-3" />
          <span className="capitalize">{program.equipment_needed} equipment</span>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end mt-4 text-primary text-sm font-medium">
          View Program
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </Card>
    </Link>
  );
}
