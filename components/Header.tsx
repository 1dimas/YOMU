"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { authApi, messagesApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Role } from "@/types";
import type { Conversation } from "@/types";

interface HeaderProps {
    userName?: string;
    userClass?: string;
}

export default function Header({ userName, userClass }: HeaderProps) {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
    });

    // Notification Bell State
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const prevUnreadCountRef = useRef<number>(0);
    const isFirstLoadRef = useRef<boolean>(true);

    // Use auth context user data if available, fallback to props
    const displayName = user?.name || userName || "User";
    const displayClass = user?.class?.name || user?.major?.name || userClass || "Siswa";

    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleOpenProfile = () => {
        if (user) {
            setEditForm({
                name: user.name || "",
                email: user.email || "",
            });
        }
        setIsProfileOpen(true);
        setIsEditing(false);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await authApi.updateProfile({
                name: editForm.name,
            });
            await refreshUser();
            setIsEditing(false);
            toast.success("Profil berhasil diperbarui!");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Gagal memperbarui profil. Silakan coba lagi.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Notification helpers
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Baru saja";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };

    // Fetch conversations for notifications
    useEffect(() => {
        const fetchConversations = async () => {
            if (!user || user.role !== Role.SISWA) return;

            try {
                setIsLoadingNotifications(true);
                const response = await messagesApi.getConversations();
                const allConversations = response.data || [];

                // Sort by lastMessageAt descending and take top 3
                const sortedConversations = allConversations.sort((a, b) => {
                    const dateA = new Date(a.lastMessageAt || 0).getTime();
                    const dateB = new Date(b.lastMessageAt || 0).getTime();
                    return dateB - dateA;
                });

                setConversations(sortedConversations.slice(0, 3));

                // Count total unread messages
                const totalUnread = allConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
                setUnreadCount(totalUnread);

                // Show toast notification if new messages arrived (skip first load)
                if (!isFirstLoadRef.current && totalUnread > prevUnreadCountRef.current) {
                    const newMessages = totalUnread - prevUnreadCountRef.current;
                    const latestConv = sortedConversations.find(c => (c.unreadCount || 0) > 0);
                    const senderName = latestConv?.otherUser?.name || 'Admin';
                    toast.info(
                        `📩 ${newMessages} pesan baru dari ${senderName}`,
                        { duration: 5000 }
                    );
                }
                prevUnreadCountRef.current = totalUnread;
                isFirstLoadRef.current = false;
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoadingNotifications(false);
            }
        };

        fetchConversations();
        // Refresh every 10 seconds for faster notification
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [user]);

    // Click outside handler for notification popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };

        if (isNotificationOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isNotificationOpen]);

    return (
        <>
            <header className="top-header">
                {/* Notification Bell - Only for SISWA role */}
                {user?.role === Role.SISWA && (
                    <div ref={notificationRef} style={{ position: "relative", marginRight: "1.5rem" }}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            style={{
                                position: "relative",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "0.5rem",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {unreadCount > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "4px",
                                        background: "#0084ff",
                                        color: "white",
                                        borderRadius: "50%",
                                        width: unreadCount > 9 ? "20px" : "18px",
                                        height: unreadCount > 9 ? "20px" : "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        border: "2px solid white",
                                    }}
                                >
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Popover */}
                        {isNotificationOpen && (
                            <div
                                style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "calc(100% + 8px)",
                                    width: "360px",
                                    background: "white",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                                    zIndex: 1000,
                                    overflow: "hidden",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                {/* Popover Header */}
                                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111827" }}>Pesan</h3>
                                    {unreadCount > 0 && (
                                        <span
                                            style={{
                                                background: "#e7f3ff",
                                                color: "#0084ff",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {unreadCount} baru
                                        </span>
                                    )}
                                </div>

                                {/* Popover Content */}
                                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                                    {isLoadingNotifications ? (
                                        <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                                            <div style={{ marginBottom: "0.5rem" }}>⏳</div>
                                            <div style={{ fontSize: "14px" }}>Memuat pesan...</div>
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                                            <div style={{ fontSize: "40px", marginBottom: "0.5rem" }}>💬</div>
                                            <div style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Belum ada pesan</div>
                                            <div style={{ fontSize: "12px", marginTop: "0.25rem" }}>Pesan dari admin akan muncul di sini</div>
                                        </div>
                                    ) : (
                                        conversations.map((conv) => {
                                            const otherUser = conv.otherUser;
                                            const isUnread = (conv.unreadCount || 0) > 0;
                                            return (
                                                <div
                                                    key={conv.id}
                                                    style={{
                                                        padding: "0.75rem 1.25rem",
                                                        borderBottom: "1px solid #f3f4f6",
                                                        cursor: "pointer",
                                                        transition: "background-color 0.15s",
                                                        backgroundColor: isUnread ? "#f8fbff" : "white",
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isUnread ? "#f8fbff" : "white")}
                                                    onClick={() => {
                                                        setIsNotificationOpen(false);
                                                        router.push("/siswa/pesan");
                                                    }}
                                                >
                                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                                        <div
                                                            style={{
                                                                width: "40px",
                                                                height: "40px",
                                                                borderRadius: "50%",
                                                                background: "linear-gradient(135deg, #e4e6eb 0%, #d0d3d9 100%)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: "14px",
                                                                fontWeight: "600",
                                                                color: "#65676b",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {getInitials(otherUser?.name || "Admin")}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.25rem" }}>
                                                                <span style={{ fontSize: "14px", fontWeight: isUnread ? "600" : "500", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {otherUser?.name || "User"}
                                                                </span>
                                                                <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "0.5rem", flexShrink: 0 }}>
                                                                    {formatTimeAgo(conv.lastMessageAt || conv.createdAt || '')}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                                <p
                                                                    style={{
                                                                        margin: 0,
                                                                        fontSize: "13px",
                                                                        color: isUnread ? "#374151" : "#6b7280",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        whiteSpace: "nowrap",
                                                                        fontWeight: isUnread ? "500" : "400",
                                                                    }}
                                                                >
                                                                    {conv.lastMessage?.content || "Belum ada pesan"}
                                                                </p>
                                                                {isUnread && (
                                                                    <div
                                                                        style={{
                                                                            width: "8px",
                                                                            height: "8px",
                                                                            borderRadius: "50%",
                                                                            background: "#0084ff",
                                                                            flexShrink: 0,
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Popover Footer */}
                                {conversations.length > 0 && (
                                    <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #e5e7eb", background: "#fafafa" }}>
                                        <button
                                            onClick={() => {
                                                setIsNotificationOpen(false);
                                                router.push("/siswa/pesan");
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: "0.625rem",
                                                background: "#0084ff",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                transition: "background-color 0.2s",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0073e6")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0084ff")}
                                        >
                                            Buka Semua Pesan
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="user-profile" onClick={handleOpenProfile} style={{ cursor: "pointer" }}>
                    <div className="user-info">
                        <div className="user-name">{displayName}</div>
                        <div className="user-role">{displayClass}</div>
                    </div>
                    <div className="user-avatar">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        ) : (
                            initials
                        )}
                    </div>
                </div>
            </header>

            {/* Profile Popup Modal */}
            {isProfileOpen && (
                <div className="modal-overlay" onClick={() => setIsProfileOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: "500px", borderRadius: "1rem", overflow: "hidden" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header with Gradient */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                padding: "2rem",
                                textAlign: "center",
                                color: "white",
                            }}
                        >
                            <div
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.2)",
                                    backdropFilter: "blur(10px)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 1rem",
                                    fontSize: "1.75rem",
                                    fontWeight: "700",
                                    border: "3px solid rgba(255,255,255,0.3)",
                                }}
                            >
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={displayName}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                            <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "700" }}>{displayName}</h2>
                            <p style={{ margin: "0.25rem 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
                                {user?.role === "ADMIN" ? "Administrator" : "Siswa"}
                            </p>
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                style={{
                                    position: "absolute",
                                    top: "1rem",
                                    right: "1rem",
                                    background: "rgba(255,255,255,0.2)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "white",
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Profile Content */}
                        <div style={{ padding: "1.5rem" }}>
                            {isEditing ? (
                                /* Edit Mode */
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            style={{
                                                width: "100%",
                                                padding: "0.75rem 1rem",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "0.5rem",
                                                fontSize: "1rem",
                                                outline: "none",
                                                transition: "border-color 0.2s",
                                            }}
                                            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                                            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            disabled
                                            style={{
                                                width: "100%",
                                                padding: "0.75rem 1rem",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "0.5rem",
                                                fontSize: "1rem",
                                                background: "#f9fafb",
                                                color: "#6b7280",
                                                cursor: "not-allowed",
                                            }}
                                        />
                                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
                                            Email tidak dapat diubah
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.75rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" width="20" height="20">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Email</p>
                                            <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>{user?.email || "-"}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.75rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" width="20" height="20">
                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Jurusan</p>
                                            <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>{user?.major?.name || "-"}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.75rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" width="20" height="20">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Kelas</p>
                                            <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>{user?.class?.name || "-"}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.75rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" width="20" height="20">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Bergabung Sejak</p>
                                            <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>{formatDate(user?.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        style={{
                                            padding: "0.75rem 1.25rem",
                                            background: "#f1f5f9",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            fontSize: "0.95rem",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            color: "#64748b",
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        style={{
                                            padding: "0.75rem 1.25rem",
                                            background: "#10b981",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            fontSize: "0.95rem",
                                            fontWeight: "600",
                                            cursor: isSaving ? "not-allowed" : "pointer",
                                            opacity: isSaving ? 0.7 : 1,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        {isSaving ? (
                                            "Menyimpan..."
                                        ) : (
                                            <>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                    <polyline points="17 21 17 13 7 13 7 21" />
                                                    <polyline points="7 3 7 8 15 8" />
                                                </svg>
                                                Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        padding: "0.75rem 1.25rem",
                                        background: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.95rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit Profil
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
