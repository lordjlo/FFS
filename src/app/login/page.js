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

                <h1 className={styles.title}>Welcome back, Kate</h1>
                <p className={styles.subtitle}>Unlock your potential and track your progress</p>

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
