"use client";

import { useAuth } from "@/lib/auth-context";

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
    const { user } = useAuth();

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            zIndex: 10,
        }}>
            {/* Left: Title & Breadcrumbs */}
            <div>
                <h1 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#111827',
                    margin: 0,
                    lineHeight: 1.3,
                }}>{title}</h1>
                {subtitle && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: '#9ca3af',
                        marginTop: '4px',
                    }}>
                        <span>Home</span>
                        <span>/</span>
                        <span style={{ color: '#22c55e', fontWeight: 500 }}>{subtitle}</span>
                    </div>
                )}
            </div>

            {/* Right: Notifications + Profile */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
            }}>
                {/* Notification Bell */}
                <button style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '8px',
                        height: '8px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid white',
                    }} />
                </button>

                {/* Divider */}
                <div style={{ width: '1px', height: '32px', background: '#e5e7eb' }} />

                {/* Profile */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: '#111827',
                            lineHeight: 1.3,
                        }}>{user?.name || 'Admin Perpus'}</div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                        }}>Administrator</div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid #e5e7eb',
                        flexShrink: 0,
                    }}>
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`}
                            alt="Admin"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
