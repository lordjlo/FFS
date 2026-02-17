"use client";

import { getLiveProgram } from "@/lib/data";
import Link from "next/link";
import { ChevronRight, PlayCircle, ClipboardList, Calendar as CalendarIcon, Plus, CheckCircle2, Play, X, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
import DashboardHeader from "@/components/DashboardHeader";
import ConsistencyCalendar from "@/components/ConsistencyCalendar";
import { createClient } from "@/utils/supabase/client";

export default function Dashboard() {
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [scheduledWorkouts, setScheduledWorkouts] = useState([]);
    const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const supabase = createClient();

    useEffect(() => {
        async function loadData() {
            try {
                // Get current user
                const { data: { user: authUser } } = await supabase.auth.getUser();
                setUser(authUser);

                const data = await getLiveProgram();
                setProgram(data);

                // Fetch scheduled workouts
                const res = await fetch('/api/schedule');
                if (res.ok) {
                    const scheduled = await res.json();
                    setScheduledWorkouts(scheduled);
                }
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [supabase]);

    const scheduleWorkout = async (workoutId, workoutName) => {
        const ds = selectedDate.toISOString().split('T')[0];
        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workout_id: workoutId,
                    scheduled_date: ds
                })
            });

            if (res.ok) {
                const refreshRes = await fetch('/api/schedule');
                if (refreshRes.ok) {
                    const updated = await refreshRes.json();
                    setScheduledWorkouts(updated);
                }
            } else {
                const errorData = await res.json();
                console.error('Schedule failed:', errorData.error);
            }
        } catch (err) {
            console.error('Failed to schedule:', err);
        }
    };

    const removeSession = async (scheduledId) => {
        // Optimistic update
        const previousScheduled = [...scheduledWorkouts];
        setScheduledWorkouts(scheduledWorkouts.filter(sw => sw.id !== scheduledId));

        try {
            const res = await fetch(`/api/schedule?id=${scheduledId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Failed to delete');
            }
        } catch (err) {
            console.error('Failed to remove session:', err);
            // Rollback on error
            setScheduledWorkouts(previousScheduled);
            alert('Could not remove session. Please try again.');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your training lab...</div>;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    const todayWorkouts = scheduledWorkouts.filter(sw => sw.scheduled_date === dateStr);

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Video Modal Overlay */}
            {selectedVideoId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    backdropFilter: 'blur(12px)'
                }}>
                    <button
                        onClick={() => setSelectedVideoId(null)}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '1rem',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <X size={24} />
                    </button>
                    <div style={{
                        width: '100%',
                        maxWidth: '900px',
                        aspectRatio: '16/9',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: '#000'
                    }}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&modestbranding=1&rel=0`}
                            title="Exercise Instruction"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            <DashboardHeader user={user} selectedDate={selectedDate} />

            <ConsistencyCalendar user={user} />

            {/* Monthly Calendar View */}
            <section style={{ marginBottom: '3rem' }}>
                <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    scheduledWorkouts={scheduledWorkouts}
                />
            </section>

            {/* Scheduled Activities */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CalendarIcon size={20} color="var(--accent)" />
                    Planned for this day
                </h2>
                {todayWorkouts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {todayWorkouts.map(sw => (
                            <div key={sw.id} className="glass" style={{
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backgroundImage: 'linear-gradient(135deg, rgba(255,138,0,0.12) 0%, rgba(255,138,0,0.02) 100%)',
                                transition: 'transform 0.2s ease, border-color 0.2s ease',
                                overflow: 'hidden'
                            }}>
                                <Link
                                    href={`/workout/${sw.workout_id}?scheduledId=${sw.id}`}
                                    style={{
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flex: 1,
                                        padding: '1.5rem',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '16px',
                                            backgroundColor: 'rgba(255,138,0,0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent)',
                                            boxShadow: '0 4px 12px rgba(255,138,0,0.1)'
                                        }}>
                                            <PlayCircle size={32} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                                                {sw.workout?.day_name || 'Workout Session'}
                                            </h3>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {sw.completed ? (
                                                    <span style={{ color: 'var(--accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <CheckCircle2 size={16} /> Completed
                                                    </span>
                                                ) : 'Click to launch training'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={22} color="var(--text-secondary)" opacity={0.6} />
                                </Link>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (confirm('Remove this session from your day?')) {
                                            removeSession(sw.id);
                                        }
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '0 1.5rem',
                                        height: '100%',
                                        color: 'rgba(255,255,255,0.3)',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ff4444'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                                    title="Remove from Day"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass" style={{
                        padding: '3rem 2rem',
                        borderRadius: '28px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        border: '1px dashed rgba(255,255,255,0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.25rem'
                    }}>
                        <div style={{ opacity: 0.5 }}><CalendarIcon size={40} /></div>
                        <div>
                            <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>Nothing scheduled yet.</p>
                            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Browse your sessions below to build your day.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Program Library Section */}
            <section className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <ClipboardList size={24} color="var(--accent)" />
                        Programme Library
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {program ? 'Select a session to view details or add to your schedule.' : 'Your personalised training programme is being prepared.'}
                    </p>
                </div>

                {program && program.weeks ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        {program.weeks.map((week) => (
                            <div key={week.weekNumber}>
                                <h3 style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--accent)',
                                    textTransform: 'uppercase',
                                    paddingBottom: '0.75rem',
                                    borderBottom: '1px solid rgba(255,138,0,0.15)',
                                    marginBottom: '1.25rem',
                                    letterSpacing: '0.15em'
                                }}>
                                    {week.name}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {week.days.map((day) => (
                                        <div key={day.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div className="glass"
                                                onClick={() => setExpandedWorkoutId(expandedWorkoutId === day.id ? null : day.id)}
                                                style={{
                                                    padding: '1.5rem',
                                                    borderRadius: '20px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                    {scheduledWorkouts.some(sw => sw.workout_id === day.id && sw.completed) && (
                                                        <CheckCircle2 size={26} color="var(--accent)" />
                                                    )}
                                                    <div>
                                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{day.name}</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                padding: '2px 8px',
                                                                background: 'rgba(255,255,255,0.05)',
                                                                borderRadius: '6px',
                                                                color: 'var(--text-secondary)'
                                                            }}>
                                                                {day.exercises?.length || 0} Exercises
                                                            </span>
                                                            <ChevronRight
                                                                size={16}
                                                                color="var(--text-secondary)"
                                                                style={{
                                                                    transform: expandedWorkoutId === day.id ? 'rotate(90deg)' : 'none',
                                                                    transition: 'transform 0.4s ease'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        scheduleWorkout(day.id, day.name);
                                                    }}
                                                    className="glass"
                                                    style={{
                                                        padding: '0.6rem 1.25rem',
                                                        borderRadius: '14px',
                                                        color: 'var(--accent)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '700',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        cursor: 'pointer',
                                                        zIndex: 2,
                                                        boxShadow: '0 4px 12px rgba(255,138,0,0.05)'
                                                    }}
                                                >
                                                    <Plus size={18} /> Schedule
                                                </button>
                                            </div>

                                            {expandedWorkoutId === day.id && (
                                                <div style={{
                                                    padding: '0 1rem 1.5rem 1.75rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '1rem',
                                                    borderLeft: '2px solid rgba(255,138,0,0.3)',
                                                    marginLeft: '0.75rem',
                                                    marginTop: '-0.25rem',
                                                    animation: 'fadeIn 0.4s ease'
                                                }}>
                                                    {day.exercises?.map((ex, idx) => (
                                                        <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '600' }}>{String(idx + 1).padStart(2, '0')}</span>
                                                                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{ex.name}</span>
                                                            </div>
                                                            {ex.video_id && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedVideoId(ex.video_id);
                                                                    }}
                                                                    style={{
                                                                        background: 'rgba(255,138,0,0.12)',
                                                                        border: '1px solid rgba(255,138,0,0.2)',
                                                                        borderRadius: '10px',
                                                                        padding: '6px 12px',
                                                                        color: 'var(--accent)',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: '600',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,138,0,0.2)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,138,0,0.12)'}
                                                                >
                                                                    <Play size={14} fill="var(--accent)" />
                                                                    Watch Prep
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '24px',
                            background: 'rgba(255, 138, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent)',
                            marginBottom: '1rem'
                        }}>
                            <ClipboardList size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Welcome to your Training Lab</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.6' }}>
                            Kate is currently tailoring your bespoke training units. You will receive an email as soon as your first week is ready to launch.
                        </p>
                        <a
                            href="https://www.instagram.com/ffs_kate/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass"
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                color: 'var(--accent)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                textDecoration: 'none',
                                marginTop: '1rem'
                            }}
                        >
                            Message Kate on Instagram
                        </a>
                    </div>
                )}
            </section>
        </div>
    );
}
