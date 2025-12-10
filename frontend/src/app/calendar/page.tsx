'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    CheckCircle2,
    Circle,
    Clock
} from 'lucide-react';

// Mock data - will be replaced with API
const MOCK_WORKOUT_DATES: Record<string, { isCompleted: boolean; muscles: string[] }> = {
    '2024-12-10': { isCompleted: true, muscles: ['Chest', 'Triceps'] },
    '2024-12-08': { isCompleted: true, muscles: ['Back', 'Biceps'] },
    '2024-12-06': { isCompleted: false, muscles: ['Legs'] },
    '2024-12-04': { isCompleted: true, muscles: ['Shoulders'] },
    '2024-12-02': { isCompleted: true, muscles: ['Core'] },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate calendar grid
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const formatDateKey = (day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getWorkoutForDay = (day: number) => {
        const dateKey = formatDateKey(day);
        return MOCK_WORKOUT_DATES[dateKey] || null;
    };

    const today = new Date();
    const isToday = (day: number) => {
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    const selectedWorkout = selectedDate ? MOCK_WORKOUT_DATES[selectedDate] : null;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-primary" />
                        Workout Calendar
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Plan and track your workouts
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/generator/muscle-selection')}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Schedule Workout
                </Button>
            </motion.div>

            {/* Calendar */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-6 bg-white/5 border-white/10">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <h2 className="text-xl font-bold">
                            {MONTHS[month]} {year}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={nextMonth}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-sm text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            if (day === null) {
                                return <div key={`empty-${idx}`} className="h-16" />;
                            }

                            const workout = getWorkoutForDay(day);
                            const dateKey = formatDateKey(day);
                            const isSelected = selectedDate === dateKey;

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dateKey)}
                                    className={`
                                        h-16 rounded-lg transition-all relative
                                        flex flex-col items-center justify-center gap-1
                                        ${isToday(day) ? 'ring-2 ring-primary' : ''}
                                        ${isSelected ? 'bg-primary/20' : 'hover:bg-white/5'}
                                        ${workout ? 'cursor-pointer' : 'cursor-default'}
                                    `}
                                >
                                    <span className={`text-sm ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                                        {day}
                                    </span>
                                    {workout && (
                                        <div className={`
                                            w-2 h-2 rounded-full
                                            ${workout.isCompleted ? 'bg-green-400' : 'bg-yellow-400'}
                                        `} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 mt-6 pt-4 border-t border-white/10 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <span>Planned/Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full ring-2 ring-primary bg-transparent" />
                            <span>Today</span>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Selected Day Details */}
            {selectedDate && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6 bg-white/5 border-white/10">
                        <h3 className="text-lg font-semibold mb-4">
                            {new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </h3>

                        {selectedWorkout ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    {selectedWorkout.isCompleted ? (
                                        <Badge className="bg-green-500/20 text-green-400 gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Completed
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-yellow-500/20 text-yellow-400 gap-1">
                                            <Circle className="w-3 h-3" />
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedWorkout.muscles.map(m => (
                                        <Badge key={m} variant="secondary">{m}</Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">View Details</Button>
                                    {!selectedWorkout.isCompleted && (
                                        <Button size="sm">Mark Complete</Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground mb-4">No workout scheduled</p>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/generator/muscle-selection')}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Schedule Workout
                                </Button>
                            </div>
                        )}
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
