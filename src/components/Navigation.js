"use client";

import Link from "next/link";
import { Home, Menu, X, Instagram, Globe, LayoutDashboard, ClipboardList, Info, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
        router.push("/");
    };

    const navLinks = [
        { name: "Home", href: "/", icon: <Home size={20} /> },
        { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "My Program", href: "/dashboard", icon: <ClipboardList size={20} /> },
        { name: "Contact & About", href: "https://www.instagram.com/ffs_kate/", icon: <Info size={20} />, isContact: true, external: true },
    ];

    const socialLinks = [
        { name: "Instagram", href: "https://www.instagram.com/ffs_kate/", icon: <Instagram size={20} /> },
        { name: "Website", href: "https://www.ffskate.co.uk", icon: <Globe size={20} /> },
    ];

    return (
        <>
            {/* Top Left Home Button */}
            <div style={{
                position: 'fixed',
                top: '1.5rem',
                left: '1.5rem',
                zIndex: 100,
                display: pathname === '/' ? 'none' : 'block'
            }}>
                <Link href="/">
                    <div className="glass" style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        color: 'var(--accent)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <Home size={24} />
                    </div>
                </Link>
            </div>

            {/* Right Side Menu Toggle */}
            <div style={{
                position: 'fixed',
                top: '1.5rem',
                right: '1.5rem',
                zIndex: 100
            }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="glass"
                    style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        color: 'var(--accent)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        outline: 'none'
                    }}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay Sidebar */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 90
                    }}
                />
            )}

            <div style={{
                position: 'fixed',
                top: 0,
                right: isOpen ? 0 : '-300px',
                width: '300px',
                height: '100vh',
                background: 'var(--background)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '5rem 2rem 2rem 2rem',
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 95,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {user && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, var(--accent), #ff8a00)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <User size={20} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                                    {user.email.split('@')[0]}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    Active Client
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '0.5rem'
                        }}>
                            Navigation
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        color: pathname === link.href ? 'var(--accent)' : 'var(--text-primary)',
                                        background: pathname === link.href ? 'rgba(255, 138, 0, 0.1)' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}>
                                        {link.icon}
                                        <span style={{ fontWeight: '500' }}>{link.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {user && (
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                color: '#ff4444',
                                background: 'rgba(255, 68, 68, 0.1)',
                                border: 'none',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <LogOut size={20} />
                            <span style={{ fontWeight: '600' }}>Logout</span>
                        </button>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '1rem'
                        }}>
                            Follow FFS Kate
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass"
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        color: 'var(--text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flex: 1,
                                        gap: '0.5rem',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {link.icon}
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
