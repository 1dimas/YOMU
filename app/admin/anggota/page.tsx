"use client";

import AdminHeader from "@/components/AdminHeader";
import AdminSkeleton from "@/components/AdminSkeleton";
import MasterDataModal from "@/components/MasterDataModal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { usersApi } from "@/lib/api";
import type { User } from "@/types";
import { Role } from "@/types";
import { toast } from "sonner";

export default function DataAnggotaPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal Form
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: Role.SISWA,
    });

    // Master Data Modal
    const [isMasterDataModalOpen, setIsMasterDataModalOpen] = useState(false);

    // Delete confirmation
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push("/login");
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await usersApi.getAll({});
                setUsers(response.data || []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchUsers();
        }
    }, [isAuthenticated, authLoading, router, user?.role]);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = ["#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#22c55e", "#06b6d4", "#eab308"];
        return colors[name.charCodeAt(0) % colors.length];
    };

    const handleTambahAnggota = () => {
        setFormMode("add");
        setFormData({ name: "", email: "", password: "", role: Role.SISWA });
        setIsFormModalOpen(true);
    };

    const handleEdit = (id: string) => {
        const u = users.find(a => a.id === id);
        if (u) {
            setFormMode("edit");
            setEditingId(id);
            setFormData({
                name: u.name,
                email: u.email,
                password: "",
                role: u.role,
            });
            setIsFormModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        const u = users.find(a => a.id === id);
        setDeleteTargetId(id);
        setDeleteTargetName(u?.name || "");
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        try {
            await usersApi.delete(deleteTargetId);
            setUsers(users.filter(u => u.id !== deleteTargetId));
            toast.success("Anggota berhasil dihapus");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus anggota");
        } finally {
            setIsDeleting(false);
            setDeleteTargetId(null);
            setDeleteTargetName("");
        }
    };

    const handleFormSubmit = async () => {
        if (!formData.name || !formData.email) {
            toast.error("Harap isi nama dan email!");
            return;
        }

        setIsSubmitting(true);
        try {
            if (formMode === "add") {
                if (!formData.password) {
                    toast.error("Harap isi password untuk anggota baru!");
                    setIsSubmitting(false);
                    return;
                }
                const newUser = await usersApi.create({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                });
                setUsers([...users, newUser.data]);
                toast.success("Anggota berhasil ditambahkan");
            } else if (editingId) {
                const updatedUser = await usersApi.update(editingId, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    ...(formData.password ? { password: formData.password } : {}),
                });
                setUsers(users.map(u => u.id === editingId ? updatedUser.data : u));
                toast.success("Anggota berhasil diperbarui");
            }
            setIsFormModalOpen(false);
            setFormData({ name: "", email: "", password: "", role: Role.SISWA });
            setEditingId(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyimpan anggota");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: Role.SISWA });
        setEditingId(null);
    };

    if (authLoading || isLoading) {
        return (
            <div className="admin-dashboard">
                <AdminHeader title="Manajemen Anggota" subtitle="Data Anggota" />
                <AdminSkeleton variant="table" columns={5} />
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Manajemen Anggota" subtitle="Data Anggota" />

            <div className="admin-content">
                {/* Title Section */}
                <div className="page-section-header">
                    <div className="section-info">
                        <h2>Data Siswa/Anggota</h2>
                        <p>Kelola informasi anggota perpustakaan dengan mudah.</p>
                    </div>
                    <div className="section-actions">
                        <div className="data-search compact">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari anggota..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn-secondary"
                            onClick={() => setIsMasterDataModalOpen(true)}
                            style={{ marginRight: "0.5rem" }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
                            </svg>
                            Master Data
                        </button>
                        <button className="btn-tambah" onClick={handleTambahAnggota}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Tambah Anggota
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>NAMA LENGKAP</th>
                                <th>KELAS</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="member-info-cell">
                                            <div className="member-avatar" style={{ backgroundColor: getAvatarColor(u.name) }}>
                                                {getInitials(u.name)}
                                            </div>
                                            <div className="member-details">
                                                <span className="member-name">{u.name}</span>
                                                <span className="member-email">{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{u.class?.name && u.major?.name ? `${u.class.name} ${u.major.name}` : u.class?.name || u.major?.name || "-"}</td>
                                    <td>
                                        <span className={`status-badge-member ${u.role === "ADMIN" ? "admin" : "aktif"}`}>
                                            {u.role === "ADMIN" ? "Admin" : "Siswa"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge-member ${u.isActive !== false ? "aktif" : "tidak-aktif"}`}>
                                            {u.isActive !== false ? "Aktif" : "Tidak Aktif"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-edit" onClick={() => handleEdit(u.id)} title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(u.id)} title="Hapus">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                                        Tidak ada data anggota
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="data-table-footer">
                        <span>Menampilkan {filteredUsers.length} dari {users.length} data</span>
                    </div>
                </div>

                <footer className="admin-footer">
                    © 2026 YOMU Library System.
                </footer>
            </div>

            {/* Modal Form Anggota */}
            {isFormModalOpen && (
                <div className="modal-overlay" onClick={handleCloseFormModal}>
                    <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{formMode === "add" ? "Pendaftaran Anggota Baru" : "Edit Data Anggota"}</h3>
                            <button className="modal-close" onClick={handleCloseFormModal}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nama Lengkap *</label>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    placeholder="email@sekolah.sch.id"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Password {formMode === "add" ? "*" : "(kosongkan jika tidak diubah)"}</label>
                                <input
                                    type="password"
                                    placeholder={formMode === "add" ? "Minimal 6 karakter" : "••••••••"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal-batal" onClick={handleCloseFormModal}>Batal</button>
                            <button
                                className="btn-modal-simpan"
                                onClick={handleFormSubmit}
                                disabled={isSubmitting}
                                style={{ opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                {isSubmitting ? "Menyimpan..." : formMode === "add" ? "Simpan Anggota" : "Simpan Perubahan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Master Data Modal */}
            <MasterDataModal
                isOpen={isMasterDataModalOpen}
                onClose={() => setIsMasterDataModalOpen(false)}
            />

            {/* Delete Confirmation Modal */}
            {deleteTargetId && (
                <div className="modal-overlay" onClick={() => { setDeleteTargetId(null); setDeleteTargetName(""); }}>
                    <div className="modal-content" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-body" style={{ padding: "2rem", textAlign: "center" }}>
                            <div style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                background: "#fef2f2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 1.25rem",
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width="28" height="28">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem", fontWeight: 700, color: "#111827" }}>
                                Hapus Anggota?
                            </h3>
                            <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.5 }}>
                                Anda yakin ingin menghapus <strong style={{ color: "#111827" }}>{deleteTargetName}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
                            </p>
                            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                                <button
                                    onClick={() => { setDeleteTargetId(null); setDeleteTargetName(""); }}
                                    style={{
                                        padding: "0.7rem 1.5rem",
                                        background: "#f3f4f6",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        color: "#374151",
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    style={{
                                        padding: "0.7rem 1.5rem",
                                        background: "#dc2626",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        cursor: isDeleting ? "not-allowed" : "pointer",
                                        opacity: isDeleting ? 0.7 : 1,
                                    }}
                                >
                                    {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
