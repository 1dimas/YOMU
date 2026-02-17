"use client";

import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
    const { user } = useAuth();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const notifications = [
        { id: 1, title: "Buku Dikembalikan", message: "Buku 'Laskar Pelangi' berhasil dikembalikan.", time: "2 jam lalu", read: false },
        { id: 2, title: "Peminjaman Disetujui", message: "Peminjaman 'Bumi Manusia' telah disetujui.", time: "1 hari lalu", read: true },
        { id: 3, title: "Pengingat", message: "Jangan lupa kembalikan buku tepat waktu.", time: "2 hari lalu", read: true },
    ];
    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

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
                <div className="notification-wrapper" style={{ position: 'relative' }}>
                    <button
                        onClick={toggleNotification}
                        style={{
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
                        {unreadCount > 0 && (
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
                        )}
                    </button>

                    {/* Dropdown Notifikasi */}
                    {isNotificationOpen && (
                        <div className="notification-dropdown" style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            width: '320px',
                            background: 'white',
                            borderRadius: '1rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #f1f5f9',
                            zIndex: 100,
                            overflow: 'hidden'
                        }}>
                            <div className="notification-header" style={{
                                padding: '1rem',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: '#1e293b' }}>Notifikasi</h3>
                                <button className="mark-read-btn" style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Tandai semua dibaca</button>
                            </div>
                            <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.map((notif) => (
                                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #f1f5f9',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        background: !notif.read ? '#f8fafc' : 'white'
                                    }}>
                                        <div className="notif-icon" style={{ flexShrink: 0 }}>
                                            {notif.title.includes("Dikembalikan") ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="20" height="20"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                                            ) : notif.title.includes("Disetujui") ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                            )}
                                        </div>
                                        <div className="notif-content">
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#1e293b' }}>{notif.title}</h4>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem' }}>{notif.message}</p>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{notif.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="notification-footer" style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                                <button style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer' }}>Lihat Semua Notifikasi</button>
                            </div>
                        </div>
                    )}
                </div>

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
