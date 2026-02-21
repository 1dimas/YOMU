"use client";

import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useRef } from "react";
import { messagesApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
}

interface NotifItem {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "message" | "loan" | "return";
    href: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotifItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch unread messages only — same as siswa header
    const fetchNotifications = async () => {
        if (!user?.id) return;
        try {
            const convRes = await messagesApi.getConversations();
            const conversations = (convRes.data || []) as Array<{
                id: string;
                lastMessageAt: string;
                unreadCount?: number;
                otherUser?: { id: string; name: string };
                lastMessage?: { content: string; createdAt: string };
            }>;

            // Total badge count
            const total = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
            setUnreadCount(total);

            // Only conversations with unread messages
            const notifs: NotifItem[] = conversations
                .filter(c => c.lastMessage && c.unreadCount && c.unreadCount > 0)
                .slice(0, 5)
                .map(c => ({
                    id: `msg-${c.id}`,
                    title: `Pesan dari ${c.otherUser?.name || "Pengguna"}`,
                    message: c.lastMessage?.content || "",
                    time: timeAgo(c.lastMessage?.createdAt || c.lastMessageAt),
                    read: false,
                    type: "message" as const,
                    href: "/admin/pesan",
                }));

            setNotifications(notifs);
        } catch (err) {
            console.error("Failed to fetch admin notifications:", err);
        }
    };

    useEffect(() => {
        if (!user?.id) return; // Wait until user is authenticated
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await messagesApi.markAllAsRead();
        } catch {
            // Best-effort — clear UI regardless
        }
        // Clear all notifications so badge disappears immediately
        setNotifications([]);
        setIsNotificationOpen(false);
    };

    const handleNotifClick = (notif: NotifItem) => {
        setIsNotificationOpen(false);
        router.push(notif.href);
    };

    const getIcon = (type: NotifItem["type"]) => {
        if (type === "message") {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" width="20" height="20">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            );
        }
        if (type === "loan") {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" width="20" height="20">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
            );
        }
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="20" height="20">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        );
    };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                {/* Notification Bell */}
                <div ref={dropdownRef} className="notification-wrapper" style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
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
                                top: '4px',
                                right: '4px',
                                minWidth: '16px',
                                height: '16px',
                                background: '#ef4444',
                                borderRadius: '999px',
                                border: '2px solid white',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 2px',
                            }}>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {isNotificationOpen && (
                        <div className="notification-dropdown" style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            width: '340px',
                            background: 'white',
                            borderRadius: '1rem',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            border: '1px solid #f1f5f9',
                            zIndex: 100,
                            overflow: 'hidden',
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '1rem',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: '#1e293b' }}>Notifikasi</h3>
                                    {unreadCount > 0 && (
                                        <span style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            borderRadius: '999px',
                                            padding: '1px 6px',
                                        }}>{unreadCount}</span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                        Tandai semua dibaca
                                    </button>
                                )}
                            </div>

                            {/* List */}
                            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" width="40" height="40" style={{ margin: '0 auto 0.75rem', display: 'block' }}>
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Tidak ada notifikasi</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotifClick(notif)}
                                            style={{
                                                padding: '0.875rem 1rem',
                                                borderBottom: '1px solid #f1f5f9',
                                                display: 'flex',
                                                gap: '0.75rem',
                                                background: !notif.read ? '#f0f9ff' : 'white',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = !notif.read ? '#f0f9ff' : 'white'; }}
                                        >
                                            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.2rem', color: '#1e293b' }}>{notif.title}</h4>
                                                    {!notif.read && <span style={{ width: '7px', height: '7px', background: '#3b82f6', borderRadius: '50%', flexShrink: 0, marginTop: '4px' }} />}
                                                </div>
                                                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.message}</p>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{notif.time}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                                    <button
                                        onClick={() => { setIsNotificationOpen(false); router.push('/admin/peminjaman'); }}
                                        style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer' }}
                                    >
                                        Lihat Semua Peminjaman →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '32px', background: '#e5e7eb' }} />

                {/* Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827', lineHeight: 1.3 }}>
                            {user?.name || 'Admin Perpus'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Administrator</div>
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
