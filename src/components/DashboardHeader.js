"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardHeader({ user, selectedDate }) {
    const [greeting, setGreeting] = useState("Welcome back");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
    }, []);

    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Guest';
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    return (
        <header style={{
            marginBottom: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            <Link href="/">
                <img
                    src="/logo.jpg"
                    alt="FFS Kate Logo"
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(255,138,0,0.15)',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
            </Link>
            <h1 style={{
                fontSize: '2.5rem',
                marginBottom: '0.5rem',
                color: 'var(--primary)',
                background: 'linear-gradient(135deg, white 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '800',
                letterSpacing: '-0.02em'
            }}>
                {greeting}, {formattedName}
            </h1>
            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: 0.8
            }}>
                {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </header>
    );
}
