'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import styles from './login.module.css'
import Image from 'next/image'
import { Chrome } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const supabase = createClient()

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (e) {
            setError(e.message)
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/logo.jpg"
                        alt="FFS Kate"
                        width={120}
                        height={120}
                        className={styles.logo}
                        priority
                    />
                </div>

                <h1 className={styles.title}>Welcome to FFS Kate</h1>
                <p className={styles.subtitle}>Unlock your potential and track your progress</p>

                <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        What should Kate call you?
                    </label>
                    <input
                        type="text"
                        placeholder="Your Name (e.g. Sarah)"
                        onChange={(e) => {
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('ffs_temp_name', e.target.value);
                            }
                        }}
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
                    />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className={styles.googleButton}
                >
                    <Chrome size={20} />
                    {loading ? 'Connecting...' : 'Continue with Google'}
                </button>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.footer}>
                    <p>© 2025 FFS Kate. Fitter. Faster. Stronger.</p>
                </div>
            </div>
        </div>
    )
}
