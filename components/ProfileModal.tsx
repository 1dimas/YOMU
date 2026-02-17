"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, refreshUser, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    // Update form when user data changes or modal opens
    // We can use a key or effect, but for simplicity let's rely on initial render or user updates
    // Actually, good to sync when opening.
    // UseEffect logic omitted for brevity, assuming parent handles open/close re-mount or we sync here.
    // Better to sync on open.
    // Let's use a simpler approach: Initialize form with current user data when editing starts.
    const handleStartEdit = () => {
        setEditForm({
            name: user?.name || "",
            email: user?.email || "",
        });
        setIsEditing(true);
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

    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "US";

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div
                className="modal-content"
                style={{
                    background: 'white',
                    width: '100%',
                    maxWidth: "500px",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    margin: '1rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
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
                            overflow: "hidden"
                        }}
                    >
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "700" }}>{user?.name}</h2>
                    <p style={{ margin: "0.25rem 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
                        {user?.role === "ADMIN" ? "Administrator" : "Siswa"}
                    </p>
                    <button
                        onClick={onClose}
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
                                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </>
                    ) : (
                        <div style={{ display: "flex", gap: "0.75rem", width: "100%", justifyContent: "flex-end" }}>
                           

                            <button
                                onClick={handleStartEdit}
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
