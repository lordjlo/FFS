"use client";

import React, { useState } from 'react';
import styles from '../app/dashboard/dashboard.module.css';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const Calendar = ({ scheduledWorkouts, onDateSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const isToday = (d) => {
        const today = new Date();
        return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const isSelected = (d) => {
        return selectedDate && d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
    };

    const getDayWorkouts = (d) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return scheduledWorkouts.filter(sw => sw.scheduled_date === dateStr);
    };

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className={styles.dayCell} />);
    }

    for (let d = 1; d <= totalDays; d++) {
        const workouts = getDayWorkouts(d);
        const hasWorkout = workouts.length > 0;
        const allCompleted = hasWorkout && workouts.every(w => w.completed);

        days.push(
            <div
                key={d}
                className={`${styles.dayCell} ${isToday(d) ? styles.today : ''} ${isSelected(d) ? styles.selected : ''} ${hasWorkout ? (allCompleted ? styles.completedWorkout : styles.hasWorkout) : ''}`}
                onClick={() => onDateSelect(new Date(year, month, d))}
            >
                <span>{d}</span>
                {allCompleted && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'var(--accent)',
                        opacity: 0.8,
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}>
                        <Check size={28} strokeWidth={3} />
                    </div>
                )}
                {hasWorkout && !allCompleted && <div className={styles.dot} />}
            </div>
        );
    }

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.calendarHeader}>
                <h3 style={{ margin: 0 }}>{monthName} {year}</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <ChevronLeft onClick={prevMonth} style={{ cursor: 'pointer' }} size={20} />
                    <ChevronRight onClick={nextMonth} style={{ cursor: 'pointer' }} size={20} />
                </div>
            </div>
            <div className={styles.dayNames}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className={styles.calendarGrid}>
                {days}
            </div>
        </div>
    );
};

export default Calendar;
