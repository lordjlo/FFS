"use client";

import { getLiveWorkout } from "@/lib/data";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Video, CheckCircle, Info, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function WorkoutPage({ params }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const scheduledId = searchParams.get('scheduledId');
    const router = useRouter();

    const [day, setDay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        async function loadWorkout() {
            if (!id) return;
            const data = await getLiveWorkout(id);
            setDay(data);
            setLoading(false);
        }
        loadWorkout();
    }, [id]);

    const toggleComplete = (id) => {
        setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading workout...</div>;
    }

    if (!day) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Workout not found.</div>;
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/dashboard">
                    <ArrowLeft size={24} style={{ cursor: 'pointer' }} />
                </Link>
                <h1 style={{ fontSize: '1.5rem' }}>{day.name}</h1>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {day.exercises.map((ex) => (
                    <div key={ex.id} className="glass" style={{
                        padding: '1.5rem',
                        borderRadius: '16px',
                        opacity: completed[ex.id] ? 0.6 : 1,
                        transition: 'var(--transition-smooth)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>{ex.name}</h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{ex.instructions}</p>
                            </div>
                            <button onClick={() => toggleComplete(ex.id)} style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                marginLeft: '1rem'
                            }}>
                                <CheckCircle size={28} color={completed[ex.id] ? "var(--accent)" : "rgba(255,255,255,0.1)"} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{ex.suggested_reps || 'AMRAP'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <input type="text" placeholder={ex.lastLog ? `Last: ${ex.lastLog.reps}` : "Lowest Reps"} style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'white'
                            }} />
                            <input type="text" placeholder={ex.lastLog ? `Last: ${ex.lastLog.weight}` : "Max Weight"} style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'white'
                            }} />
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            {ex.videoUrl ? (
                                <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--accent)'
                                }}>
                                    <Video size={18} />
                                    Watch Form Guide
                                </a>
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Video Coming Soon</span>
                            )}
                            <button style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}>
                                <Info size={18} />
                                Tips
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={async () => {
                    if (!scheduledId) {
                        alert("Great job! (This was a preview, schedule it to save results)");
                        router.push('/dashboard');
                        return;
                    }

                    setIsSubmitting(true);
                    try {
                        const res = await fetch('/api/workout/completion', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: scheduledId,
                                completed: true
                            })
                        });

                        if (res.ok) {
                            setIsFinished(true);
                            // Celebration Splash
                            const end = Date.now() + 2 * 1000;
                            const colors = ["#ff8a00", "#ffffff", "#ff4444"];

                            (function frame() {
                                confetti({
                                    particleCount: 3,
                                    angle: 60,
                                    spread: 55,
                                    origin: { x: 0 },
                                    colors: colors
                                });
                                confetti({
                                    particleCount: 3,
                                    angle: 120,
                                    spread: 55,
                                    origin: { x: 1 },
                                    colors: colors
                                });

                                if (Date.now() < end) {
                                    requestAnimationFrame(frame);
                                }
                            }());

                            setTimeout(() => router.push('/dashboard'), 3000);
                        }
                    } catch (err) {
                        console.error('Failed to finish workout:', err);
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
                disabled={isSubmitting || isFinished}
                style={{
                    marginTop: '3rem',
                    width: '100%',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-pill)',
                    background: isFinished ? '#4ade80' : 'var(--accent)',
                    color: 'var(--background)',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    cursor: (isSubmitting || isFinished) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                }}
            >
                {isSubmitting ? 'Saving...' : isFinished ? (
                    <>
                        <Check size={24} /> Finished!
                    </>
                ) : 'Finish Workout'}
            </button>
        </div>
    );
}
