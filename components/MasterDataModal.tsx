"use client";

import { useState, useEffect } from "react";
import { majorsApi, classesApi } from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";

interface MasterDataItem {
    id: string;
    name: string;
    createdAt: string;
    _count: { users: number };
}

interface MasterDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MasterDataModal({ isOpen, onClose }: MasterDataModalProps) {
    const [activeTab, setActiveTab] = useState<"jurusan" | "kelas">("jurusan");
    const [majors, setMajors] = useState<MasterDataItem[]>([]);
    const [classes, setClasses] = useState<MasterDataItem[]>([]);
    const [newMajorName, setNewMajorName] = useState("");
    const [newClassName, setNewClassName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ type: "jurusan" | "kelas"; id: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [majorsRes, classesRes] = await Promise.all([
                majorsApi.getAll(),
                classesApi.getAll(),
            ]);
            setMajors(majorsRes.data || []);
            setClasses(classesRes.data || []);
        } catch (error) {
            console.error("Failed to fetch master data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMajor = async () => {
        if (!newMajorName.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await majorsApi.create(newMajorName.trim());
            setMajors([...majors, { ...response.data, _count: { users: 0 } }]);
            setNewMajorName("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menambah jurusan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddClass = async () => {
        if (!newClassName.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await classesApi.create(newClassName.trim());
            setClasses([...classes, { ...response.data, _count: { users: 0 } }]);
            setNewClassName("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menambah kelas");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMajor = (id: string) => {
        setConfirmDelete({ type: "jurusan", id });
    };

    const handleDeleteClass = (id: string) => {
        setConfirmDelete({ type: "kelas", id });
    };

    const executeDelete = async () => {
        if (!confirmDelete) return;
        try {
            if (confirmDelete.type === "jurusan") {
                await majorsApi.delete(confirmDelete.id);
                setMajors(majors.filter((m) => m.id !== confirmDelete.id));
                toast.success("Jurusan berhasil dihapus");
            } else {
                await classesApi.delete(confirmDelete.id);
                setClasses(classes.filter((c) => c.id !== confirmDelete.id));
                toast.success("Kelas berhasil dihapus");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Gagal menghapus ${confirmDelete.type}`);
        } finally {
            setConfirmDelete(null);
        }
    };

    if (!isOpen) return null;

    const renderItems = (items: MasterDataItem[], type: "jurusan" | "kelas") => {
        const handleDel = type === "jurusan" ? handleDeleteMajor : handleDeleteClass;
        if (items.length === 0) {
            return (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                    <div style={{
                        width: "56px", height: "56px", borderRadius: "50%",
                        background: "#f3f4f6", display: "flex", alignItems: "center",
                        justifyContent: "center", margin: "0 auto 12px",
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
                        Belum ada data {type}
                    </p>
                    <p style={{ color: "#d1d5db", fontSize: "0.75rem", margin: "4px 0 0" }}>
                        Tambahkan {type} baru menggunakan form di atas
                    </p>
                </div>
            );
        }
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                {items.map((item, index) => (
                    <div key={item.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px", background: "#f9fafb", borderRadius: "10px",
                        border: "1px solid #f3f4f6", transition: "all 0.15s",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{
                                width: "28px", height: "28px", borderRadius: "8px",
                                background: "white", border: "1px solid #e5e7eb",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.75rem", fontWeight: 700, color: "#6b7280",
                            }}>
                                {index + 1}
                            </span>
                            <div>
                                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>
                                    {item.name}
                                </span>
                                {item._count.users > 0 && (
                                    <span style={{
                                        marginLeft: "8px", padding: "2px 8px", borderRadius: "9999px",
                                        background: "#eff6ff", color: "#2563eb", fontSize: "0.7rem", fontWeight: 600,
                                        border: "1px solid #dbeafe",
                                    }}>
                                        {item._count.users} anggota
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDel(item.id)}
                            disabled={item._count.users > 0}
                            title={item._count.users > 0 ? `Tidak bisa hapus ${type} yang memiliki anggota` : `Hapus ${type}`}
                            style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: item._count.users > 0 ? "not-allowed" : "pointer",
                                background: item._count.users > 0 ? "#f9fafb" : "#fef2f2",
                                borderColor: item._count.users > 0 ? "#e5e7eb" : "#fecaca",
                                opacity: item._count.users > 0 ? 0.5 : 1,
                                transition: "all 0.15s",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item._count.users > 0 ? "#9ca3af" : "#ef4444"} strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
                justifyContent: "center", zIndex: 1000,
                animation: "mdmFadeIn 0.15s ease-out",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white", borderRadius: "20px", width: "90%", maxWidth: "560px",
                    maxHeight: "85vh", display: "flex", flexDirection: "column",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
                    animation: "mdmSlideIn 0.2s ease-out", overflow: "hidden",
                }}
            >
                {/* Header */}
                <div style={{
                    padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: 20, height: 20 }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
                                Master Data Anggota
                            </h2>
                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>
                                Kelola jurusan dan kelas
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            border: "none", background: "#f3f4f6", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#6b7280", transition: "all 0.15s",
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ padding: "12px 24px 0", display: "flex", gap: "6px" }}>
                    {(["jurusan", "kelas"] as const).map((tab) => {
                        const isActiveTab = activeTab === tab;
                        const count = tab === "jurusan" ? majors.length : classes.length;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "8px 16px", borderRadius: "9999px",
                                    border: "1px solid",
                                    borderColor: isActiveTab ? "#3b82f6" : "#e5e7eb",
                                    background: isActiveTab ? "#eff6ff" : "white",
                                    color: isActiveTab ? "#2563eb" : "#6b7280",
                                    fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: "6px",
                                    transition: "all 0.15s",
                                }}
                            >
                                {tab === "jurusan" ? "Jurusan" : "Kelas"}
                                <span style={{
                                    padding: "1px 7px", borderRadius: "9999px", fontSize: "0.7rem",
                                    background: isActiveTab ? "#3b82f6" : "#e5e7eb",
                                    color: isActiveTab ? "white" : "#6b7280",
                                    fontWeight: 700,
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Body */}
                <div style={{ padding: "16px 24px", flex: 1, overflowY: "auto" }}>
                    {isLoading ? (
                        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                            <div style={{
                                width: "36px", height: "36px", border: "3px solid #e5e7eb",
                                borderTop: "3px solid #3b82f6", borderRadius: "50%",
                                animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
                            }} />
                            <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>Memuat data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Add Input */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "block", marginBottom: "6px", fontWeight: 600,
                                    fontSize: "0.75rem", color: "#6b7280",
                                    textTransform: "uppercase", letterSpacing: "0.05em",
                                }}>
                                    {activeTab === "jurusan" ? "Tambah Jurusan Baru" : "Tambah Kelas Baru"}
                                </label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        type="text"
                                        placeholder={activeTab === "jurusan" ? "Contoh: RPL, TKJ, MM" : "Contoh: X, XI, XII"}
                                        value={activeTab === "jurusan" ? newMajorName : newClassName}
                                        onChange={(e) => activeTab === "jurusan" ? setNewMajorName(e.target.value) : setNewClassName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (activeTab === "jurusan" ? handleAddMajor() : handleAddClass())}
                                        disabled={isSubmitting}
                                        style={{
                                            flex: 1, padding: "10px 14px",
                                            border: "1px solid #e5e7eb", borderRadius: "10px",
                                            fontSize: "0.875rem", outline: "none",
                                            background: "#f9fafb", transition: "all 0.15s",
                                            fontFamily: "inherit",
                                        }}
                                    />
                                    <button
                                        onClick={activeTab === "jurusan" ? handleAddMajor : handleAddClass}
                                        disabled={isSubmitting || !(activeTab === "jurusan" ? newMajorName.trim() : newClassName.trim())}
                                        style={{
                                            padding: "10px 18px", border: "none", borderRadius: "10px",
                                            background: "#3b82f6", color: "white",
                                            fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: "6px",
                                            opacity: isSubmitting || !(activeTab === "jurusan" ? newMajorName.trim() : newClassName.trim()) ? 0.5 : 1,
                                            transition: "all 0.15s", whiteSpace: "nowrap",
                                            boxShadow: "0 2px 8px rgba(59,130,246,0.25)",
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                        Tambah
                                    </button>
                                </div>
                            </div>

                            {/* Items List */}
                            {activeTab === "jurusan"
                                ? renderItems(majors, "jurusan")
                                : renderItems(classes, "kelas")
                            }
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "14px 24px", borderTop: "1px solid #f1f5f9",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#fafbfc",
                }}>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                        {activeTab === "jurusan" ? majors.length : classes.length} {activeTab} terdaftar
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 24px", borderRadius: "10px",
                            border: "1px solid #e5e7eb", background: "white",
                            color: "#374151", fontSize: "0.8rem", fontWeight: 600,
                            cursor: "pointer", transition: "all 0.15s",
                        }}
                    >
                        Selesai
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!confirmDelete}
                title={`Hapus ${confirmDelete?.type === "jurusan" ? "Jurusan" : "Kelas"}`}
                message={`Apakah Anda yakin ingin menghapus ${confirmDelete?.type} ini? Data yang dihapus tidak dapat dikembalikan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="danger"
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete(null)}
            />

            <style>{`
                @keyframes mdmFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes mdmSlideIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
