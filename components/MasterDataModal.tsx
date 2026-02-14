"use client";

import { useState, useEffect } from "react";
import { majorsApi, classesApi } from "@/lib/api";

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
            alert(error instanceof Error ? error.message : "Gagal menambah jurusan");
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
            alert(error instanceof Error ? error.message : "Gagal menambah kelas");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMajor = async (id: string) => {
        if (!confirm("Hapus jurusan ini?")) return;
        try {
            await majorsApi.delete(id);
            setMajors(majors.filter((m) => m.id !== id));
        } catch (error) {
            alert(error instanceof Error ? error.message : "Gagal menghapus jurusan");
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm("Hapus kelas ini?")) return;
        try {
            await classesApi.delete(id);
            setClasses(classes.filter((c) => c.id !== id));
        } catch (error) {
            alert(error instanceof Error ? error.message : "Gagal menghapus kelas");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                style={{ maxWidth: "600px", maxHeight: "80vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Master Data Anggota</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                    <button
                        onClick={() => setActiveTab("jurusan")}
                        style={{
                            padding: "0.75rem 1.5rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            borderBottom: activeTab === "jurusan" ? "2px solid #3b82f6" : "2px solid transparent",
                            color: activeTab === "jurusan" ? "#3b82f6" : "#6b7280",
                            fontWeight: activeTab === "jurusan" ? 600 : 400,
                        }}
                    >
                        Daftar Jurusan
                    </button>
                    <button
                        onClick={() => setActiveTab("kelas")}
                        style={{
                            padding: "0.75rem 1.5rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            borderBottom: activeTab === "kelas" ? "2px solid #3b82f6" : "2px solid transparent",
                            color: activeTab === "kelas" ? "#3b82f6" : "#6b7280",
                            fontWeight: activeTab === "kelas" ? 600 : 400,
                        }}
                    >
                        Daftar Kelas
                    </button>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>Memuat...</div>
                ) : (
                    <>
                        {/* Jurusan Tab */}
                        {activeTab === "jurusan" && (
                            <div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                                        NAMA JURUSAN BARU
                                    </label>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <input
                                            type="text"
                                            placeholder="Contoh: RPL"
                                            value={newMajorName}
                                            onChange={(e) => setNewMajorName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddMajor()}
                                            style={{
                                                flex: 1,
                                                padding: "0.75rem",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "0.5rem",
                                                fontSize: "1rem",
                                            }}
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            onClick={handleAddMajor}
                                            disabled={isSubmitting || !newMajorName.trim()}
                                            style={{
                                                padding: "0.75rem 1.5rem",
                                                background: "#3b82f6",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "0.5rem",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                opacity: isSubmitting || !newMajorName.trim() ? 0.5 : 1,
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                            Tambah
                                        </button>
                                    </div>
                                </div>

                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: "0.875rem" }}>NO</th>
                                            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: "0.875rem" }}>NAMA JURUSAN</th>
                                            <th style={{ padding: "0.75rem", textAlign: "right", fontWeight: 500, color: "#6b7280", fontSize: "0.875rem" }}>AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {majors.map((major, index) => (
                                            <tr key={major.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                <td style={{ padding: "0.75rem" }}>{index + 1}</td>
                                                <td style={{ padding: "0.75rem" }}>{major.name}</td>
                                                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                                                    <button
                                                        onClick={() => handleDeleteMajor(major.id)}
                                                        disabled={major._count.users > 0}
                                                        title={major._count.users > 0 ? "Tidak bisa hapus jurusan yang memiliki anggota" : "Hapus jurusan"}
                                                        style={{
                                                            padding: "0.25rem",
                                                            background: major._count.users > 0 ? "#f3f4f6" : "#fee2e2",
                                                            border: "none",
                                                            borderRadius: "0.25rem",
                                                            cursor: major._count.users > 0 ? "not-allowed" : "pointer",
                                                            opacity: major._count.users > 0 ? 0.5 : 1,
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={major._count.users > 0 ? "#9ca3af" : "#ef4444"} strokeWidth="2">
                                                            <polyline points="3,6 5,6 21,6" />
                                                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {majors.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                                                    Belum ada data jurusan
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Kelas Tab */}
                        {activeTab === "kelas" && (
                            <div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                                        NAMA KELAS BARU
                                    </label>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <input
                                            type="text"
                                            placeholder="Contoh: X, XI, XII"
                                            value={newClassName}
                                            onChange={(e) => setNewClassName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                                            style={{
                                                flex: 1,
                                                padding: "0.75rem",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "0.5rem",
                                                fontSize: "1rem",
                                            }}
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            onClick={handleAddClass}
                                            disabled={isSubmitting || !newClassName.trim()}
                                            style={{
                                                padding: "0.75rem 1.5rem",
                                                background: "#3b82f6",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "0.5rem",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                opacity: isSubmitting || !newClassName.trim() ? 0.5 : 1,
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                            Tambah
                                        </button>
                                    </div>
                                </div>

                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: "0.875rem" }}>NO</th>
                                            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: "0.875rem" }}>NAMA KELAS</th>
                                            <th style={{ padding: "0.75rem", textAlign: "right", fontWeight: 500, color: "#6b7280", fontSize: "0.875rem" }}>AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classes.map((cls, index) => (
                                            <tr key={cls.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                <td style={{ padding: "0.75rem" }}>{index + 1}</td>
                                                <td style={{ padding: "0.75rem" }}>{cls.name}</td>
                                                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                                                    <button
                                                        onClick={() => handleDeleteClass(cls.id)}
                                                        disabled={cls._count.users > 0}
                                                        title={cls._count.users > 0 ? "Tidak bisa hapus kelas yang memiliki anggota" : "Hapus kelas"}
                                                        style={{
                                                            padding: "0.25rem",
                                                            background: cls._count.users > 0 ? "#f3f4f6" : "#fee2e2",
                                                            border: "none",
                                                            borderRadius: "0.25rem",
                                                            cursor: cls._count.users > 0 ? "not-allowed" : "pointer",
                                                            opacity: cls._count.users > 0 ? 0.5 : 1,
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cls._count.users > 0 ? "#9ca3af" : "#ef4444"} strokeWidth="2">
                                                            <polyline points="3,6 5,6 21,6" />
                                                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {classes.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                                                    Belum ada data kelas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "0.75rem 2rem",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            fontWeight: 500,
                        }}
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    );
}
