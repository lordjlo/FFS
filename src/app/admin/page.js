"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Users, FileSpreadsheet, PlayCircle, AlertCircle, CheckCircle } from "lucide-react";

import { isAdmin } from "@/utils/admin";

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [spreadsheetId, setSpreadsheetId] = useState("");
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();

            // Client-Side Gate
            if (!user) {
                router.push('/login');
                return;
            }

            if (!isAdmin(user.email)) {
                router.push('/dashboard'); // Kick non-admins back to dashboard
                return;
            }

            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) {
                    throw new Error('Unauthorized or Failed to load');
                }
                const data = await res.json();
                setUsers(data);
            } catch (err) {
                console.error(err);
                setStatus({ type: 'error', message: 'Access Denied or API Error' });
                // Optional: router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [router, supabase]);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        setAssigning(true);
        setStatus(null);

        try {
            const res = await fetch('/api/admin/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetEmail: selectedUser,
                    spreadsheetId: spreadsheetId || undefined // Send undefined to use default
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Assignment failed');

            setStatus({ type: 'success', message: `Program assigned successfully to ${selectedUser}` });
            setSpreadsheetId(""); // Clear input
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Control Room...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255,138,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)'
                    }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Admin Control Room</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Assign training programs to clients</p>
                    </div>
                </div>

                <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Select Client
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        >
                            <option value="">-- Choose a user --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.email}>
                                    {u.display_name || u.email} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Google Sheet ID (Optional)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FileSpreadsheet
                                size={20}
                                color="var(--text-secondary)"
                                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <input
                                type="text"
                                placeholder="Leave empty to use Default Master Sheet"
                                value={spreadsheetId}
                                onChange={(e) => setSpreadsheetId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Paste a specific Sheet ID if this client needs a custom program. Otherwise, the Master Sheet will be used.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={assigning || !selectedUser}
                        className="primary-btn"
                        style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            fontWeight: '600',
                            marginTop: '1rem',
                            opacity: assigning || !selectedUser ? 0.7 : 1,
                            cursor: assigning || !selectedUser ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {assigning ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <PlayCircle size={20} /> Assign Program
                            </>
                        )}
                    </button>
                </form>

                {status && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: status.type === 'success' ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                        border: `1px solid ${status.type === 'success' ? 'rgba(0, 255, 100, 0.2)' : 'rgba(255, 68, 68, 0.2)'}`,
                        color: status.type === 'success' ? '#00ff64' : '#ff4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}
