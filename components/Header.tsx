"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Role } from "@/types";
import type { Conversation } from "@/types";

interface HeaderProps {
    userName?: string;
    userClass?: string;
    userRole?: Role;
}

export default function Header({ userName, userClass, userRole }: HeaderProps) {
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
    const notifications = [
        { id: 1, title: "Buku Dikembalikan", message: "Buku 'Laskar Pelangi' berhasil dikembalikan.", time: "2 jam lalu", read: false },
        { id: 2, title: "Peminjaman Disetujui", message: "Peminjaman 'Bumi Manusia' telah disetujui.", time: "1 hari lalu", read: true },
        { id: 3, title: "Pengingat", message: "Jangan lupa kembalikan buku tepat waktu.", time: "2 hari lalu", read: true },
    ];
    const unreadCount = notifications.filter(n => !n.read).length;

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Initial Display Data
    const displayName = user?.name || userName || "Guest";
    const displayClass = user?.class?.name || userClass || (user?.role === "ADMIN" ? "Administrator" : "Siswa");
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
    const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

    // Search handler
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/siswa/katalog?search=${encodeURIComponent(searchQuery)}`);
        }
    };


    return (
        <>
            <header className="top-header">
                {/* Search Bar - Hidden on Mobile, specific style */}
                <form onSubmit={handleSearch} className={`search-bar ${isSearchFocused ? 'focused' : ''}`}>
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Cari buku, kategori, atau penulis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="search-clear"
                            onClick={() => setSearchQuery("")}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </form>

                {/* Notification Bell */}
                <div className="notification-wrapper" style={{ position: 'relative', marginRight: '1rem' }}>
                    <button
                        className="notification-btn"
                        onClick={toggleNotification}
                        title="Notifikasi"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '0.7rem',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>{unreadCount}</span>
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
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Notifikasi</h3>
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
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{notif.title}</h4>
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

                <div className="user-profile" onClick={handleOpenProfile} style={{ cursor: "pointer" }}>
                    <div className="user-info">
                        <div className="user-name">{displayName}</div>
                        <div className="user-role">{displayClass}</div>
                    </div>
                    <div className="user-avatar">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        ) : (
                            <span>{initials}</span>
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
                                position: 'relative'
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
                                    overflow: 'hidden'
                                }}
                            >
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={displayName}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
