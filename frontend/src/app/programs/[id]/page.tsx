'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Pause,
  Play,
  Target,
  Trophy,
  Users,
  XCircle,
  Zap,
  Eye,
} from 'lucide-react';
import { workoutAPI } from '@/lib/api-client';
import { useWorkoutSessionStore } from '@/store/workout-session-store';
import Link from 'next/link';
import {
  useProgramDetail,
  useEnrollments,
  useActiveEnrollment,
  getDifficultyColor,
  getGoalIcon,
} from '@/lib/hooks';
import { AsyncDataWrapper, SkeletonCard } from '@/components/ui/async-data-wrapper';
import type { ProgramDay } from '@/types/program';

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const programId = parseInt(id, 10);
  const router = useRouter();

  const { program, isLoading, error, refetch } = useProgramDetail(programId);
  const { enrollment: activeEnrollment, hasActiveEnrollment, refetch: refetchActive } = useActiveEnrollment();
  const { enroll, completeDay, pause, resume, abandon, isActionLoading } = useEnrollments();

  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [showCompleteDayDialog, setShowCompleteDayDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ProgramDay | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [generatingDayId, setGeneratingDayId] = useState<number | null>(null);

  const setWorkout = useWorkoutSessionStore((state) => state.setWorkout);

  // Check if user is enrolled in THIS program
  const isEnrolledInThis = activeEnrollment?.program?.id === programId;
  const currentEnrollment = isEnrolledInThis ? activeEnrollment : null;

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) =>
      prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
    );
  };

  const handleEnroll = async () => {
    const result = await enroll(programId);
    if (result.success) {
      setShowEnrollDialog(false);
      refetch();
      refetchActive();
    }
  };

  const handlePause = async () => {
    if (!currentEnrollment) return;
    await pause(currentEnrollment.id);
    refetchActive();
  };

  const handleResume = async () => {
    if (!currentEnrollment) return;
    await resume(currentEnrollment.id);
    refetchActive();
  };

  const handleAbandon = async () => {
    if (!currentEnrollment) return;
    await abandon(currentEnrollment.id);
    setShowAbandonDialog(false);
    refetchActive();
    refetch();
  };

  const handleCompleteDay = async () => {
    if (!currentEnrollment || !selectedDay) return;
    const result = await completeDay(currentEnrollment.id, selectedDay.id, undefined, completionNotes);
    setShowCompleteDayDialog(false);
    setSelectedDay(null);
    setCompletionNotes('');
    if (result.success) {
      // Refetch to update UI with new completion status
      await Promise.all([refetch(), refetchActive()]);
    } else {
      // Show error in console (toast would be better)
      console.error('Failed to complete day:', result.error);
    }
  };

  const openCompleteDayDialog = (day: ProgramDay) => {
    setSelectedDay(day);
    setShowCompleteDayDialog(true);
  };

  // Generate and start workout for a program day
  const handleStartWorkout = async (day: ProgramDay) => {
    setGeneratingDayId(day.id);
    
    try {
      // Map program intensity to workout generator intensity
      const intensityMap: Record<string, 'light' | 'moderate' | 'intense'> = {
        light: 'light',
        moderate: 'moderate',
        intense: 'intense',
      };
      
      // Map equipment
      const equipmentMap: Record<string, 'bodyweight' | 'home' | 'gym'> = {
        bodyweight: 'bodyweight',
        home: 'home',
        gym: 'gym',
      };
      
      // Generate workout using the day's parameters
      const workoutData = await workoutAPI.generateWorkout({
        muscles_targeted: day.muscles_targeted,
        duration: day.duration_minutes || day.duration || 30,
        intensity: intensityMap[day.intensity] || 'moderate',
        goal: 'hypertrophy', // Default goal
        equipment: equipmentMap[program?.equipment_needed || 'gym'] || 'gym',
      });
      
      // Store the workout in session
      setWorkout({
        exercises: workoutData.exercises || [],
        muscles_targeted: day.muscles_targeted,
        duration: day.duration_minutes || day.duration || 30,
        intensity: day.intensity,
        goal: 'hypertrophy',
        equipment: program?.equipment_needed || 'gym',
      });
      
      // Navigate to workout view
      router.push('/workout/active');
    } catch (err) {
      console.error('Failed to generate workout:', err);
    } finally {
      setGeneratingDayId(null);
    }
  };

  // Check if a day is completed
  const isDayCompleted = (day: ProgramDay) => {
    // Backend returns program_day as just the ID (number), not an object
    return currentEnrollment?.completed_days?.some((c) => {
      const programDayId = typeof c.program_day === 'object' ? c.program_day?.id : c.program_day;
      return programDayId === day.id;
    }) ?? false;
  };

  // Check if day is the next one to complete
  const isNextDay = (day: ProgramDay) => {
    return currentEnrollment?.next_day?.id === day.id;
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Back Button */}
      <Link href="/programs">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>
      </Link>

      <AsyncDataWrapper
        data={program}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        skeleton={
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        }
        isEmpty={(data) => !data}
        emptyComponent={
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl font-medium mb-2">Program not found</p>
            <Link href="/programs">
              <Button>Browse Programs</Button>
            </Link>
          </Card>
        }
      >
        {program && (
          <>
            {/* Header */}
            <Card className="p-8 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon */}
                <div
                  className="text-6xl p-4 rounded-2xl w-fit"
                  style={{ backgroundColor: program.color + '20' }}
                >
                  {program.icon}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={getDifficultyColor(program.difficulty)}>
                      {program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {getGoalIcon(program.goal)} {program.goal.replace('_', ' ')}
                    </Badge>
                    {program.is_featured && (
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold mb-2">{program.name}</h1>
                  <p className="text-muted-foreground mb-4">{program.description}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{program.duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      <span>{program.days_per_week} days/week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="capitalize">{program.equipment_needed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{program.enrolled_count} enrolled</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!hasActiveEnrollment && (
                    <Button size="lg" onClick={() => setShowEnrollDialog(true)}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Program
                    </Button>
                  )}

                  {isEnrolledInThis && currentEnrollment?.status === 'active' && (
                    <>
                      <Button size="lg" variant="outline" onClick={handlePause} disabled={isActionLoading}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={() => setShowAbandonDialog(true)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Abandon
                      </Button>
                    </>
                  )}

                  {isEnrolledInThis && currentEnrollment?.status === 'paused' && (
                    <>
                      <Button size="lg" onClick={handleResume} disabled={isActionLoading}>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={() => setShowAbandonDialog(true)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Abandon
                      </Button>
                    </>
                  )}

                  {hasActiveEnrollment && !isEnrolledInThis && (
                    <p className="text-sm text-muted-foreground text-center">
                      You have another<br />program in progress
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar (if enrolled) */}
              {isEnrolledInThis && currentEnrollment && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Week {currentEnrollment.current_week} • Day {currentEnrollment.current_day}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {currentEnrollment.completion_percentage}% complete
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${currentEnrollment.completion_percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>
                      {currentEnrollment.completed_days_count} of {currentEnrollment.total_days_count} days completed
                    </span>
                    {currentEnrollment.status === 'paused' && (
                      <Badge variant="outline" className="text-yellow-500">
                        Paused
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Schedule */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Program Schedule
              </h2>

              <div className="space-y-4">
                {program.schedule?.map((week) => (
                  <div key={week.week} className="border rounded-lg overflow-hidden">
                    {/* Week Header */}
                    <button
                      className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                      onClick={() => toggleWeek(week.week)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">Week {week.week}</span>
                        <span className="text-sm text-muted-foreground">
                          {week.days.length} days
                        </span>
                        {isEnrolledInThis && currentEnrollment?.current_week === week.week && (
                          <Badge variant="outline" className="text-primary border-primary">
                            Current Week
                          </Badge>
                        )}
                      </div>
                      {expandedWeeks.includes(week.week) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>

                    {/* Week Days */}
                    {expandedWeeks.includes(week.week) && (
                      <div className="divide-y">
                        {week.days.map((day) => (
                          <DayRow
                            key={day.id}
                            day={day}
                            isCompleted={isDayCompleted(day)}
                            isNext={isNextDay(day)}
                            isEnrolled={isEnrolledInThis}
                            isPaused={currentEnrollment?.status === 'paused'}
                            onComplete={() => openCompleteDayDialog(day)}
                            onStartWorkout={() => handleStartWorkout(day)}
                            isGenerating={generatingDayId === day.id}
                            equipment={program?.equipment_needed || 'gym'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </AsyncDataWrapper>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start {program?.name}?</DialogTitle>
            <DialogDescription>
              You&apos;re about to start a {program?.duration_weeks}-week program with{' '}
              {program?.days_per_week} workouts per week.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Once you start, you can pause or abandon the program at any time. Only one program can
              be active at a time.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnroll} disabled={isActionLoading}>
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Abandon Dialog */}
      <Dialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abandon Program?</DialogTitle>
            <DialogDescription>
              Are you sure you want to abandon {program?.name}? Your progress will be saved but you
              won&apos;t be able to continue from where you left off.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbandonDialog(false)}>
              Keep Going
            </Button>
            <Button variant="destructive" onClick={handleAbandon} disabled={isActionLoading}>
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Abandon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Day Dialog */}
      <Dialog open={showCompleteDayDialog} onOpenChange={setShowCompleteDayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete {selectedDay?.name}?</DialogTitle>
            <DialogDescription>Mark this day as complete to track your progress.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              placeholder="How did the workout go? Any adjustments made?"
              value={completionNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompletionNotes(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDayDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteDay} disabled={isActionLoading}>
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DayRow({
  day,
  isCompleted,
  isNext,
  isEnrolled,
  isPaused,
  onComplete,
  onStartWorkout,
  isGenerating,
  equipment,
}: {
  day: ProgramDay;
  isCompleted: boolean;
  isNext: boolean;
  isEnrolled: boolean;
  isPaused: boolean;
  onComplete: () => void;
  onStartWorkout: () => void;
  isGenerating: boolean;
  equipment: string;
}) {
  const router = useRouter();
  const intensityColors: Record<string, string> = {
    light: 'text-green-500',
    moderate: 'text-yellow-500',
    intense: 'text-red-500',
  };

  return (
    <div
      className={`p-4 flex items-center gap-4 ${
        isCompleted ? 'bg-green-500/5' : isNext ? 'bg-primary/5' : ''
      }`}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : day.is_rest_day ? (
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
            R
          </div>
        ) : isNext ? (
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
            {day.day_number}
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
            {day.day_number}
          </div>
        )}
      </div>

      {/* Day Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{day.name}</span>
          {isNext && !isPaused && (
            <Badge variant="outline" className="text-primary border-primary text-xs">
              Next Up
            </Badge>
          )}
          {day.is_rest_day && (
            <Badge variant="outline" className="text-xs">
              Rest Day
            </Badge>
          )}
        </div>
        {!day.is_rest_day && (
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{day.muscles_targeted.join(', ')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{day.duration_minutes || day.duration} min</span>
            </div>
            <div className={`flex items-center gap-1 ${intensityColors[day.intensity]}`}>
              <Flame className="h-3 w-3" />
              <span className="capitalize">{day.intensity}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {!day.is_rest_day && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onStartWorkout}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Start Workout
          </Button>
        )}
        {isEnrolled && !isCompleted && !day.is_rest_day && !isPaused && (
          <Button size="sm" variant={isNext ? 'default' : 'outline'} onClick={onComplete}>
            <Check className="h-4 w-4 mr-1" />
            Complete
          </Button>
        )}
        {isCompleted && <span className="text-sm text-green-500 font-medium">Completed</span>}
      </div>
    </div>
  );
}
