"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ConsistencyCalendar({ user }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchLogs() {
            if (!user) return;

            // Get logs from last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data, error } = await supabase
                .from('logs')
                .select('timestamp')
                .eq('user_id', user.id)
                .gte('timestamp', thirtyDaysAgo.toISOString());

            if (data) {
                // Normalize to YYYY-MM-DD
                const uniqueDates = [...new Set(data.map(log => log.timestamp.split('T')[0]))];
                setLogs(uniqueDates);
            }
            setLoading(false);
        }
        fetchLogs();
    }, [user, supabase]);

    // Generate last 14 days for display
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    if (loading) return null;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem',
            gap: '0.5rem'
        }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Recent Consistency
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
                {days.map(date => {
                    const isActive = logs.includes(date);
                    return (
                        <div key={date} style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            backgroundColor: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                            boxShadow: isActive ? '0 0 8px var(--accent)' : 'none',
                            transition: 'all 0.3s ease'
                        }} title={date} />
                    );
                })}
            </div>
        </div>
    );
}
