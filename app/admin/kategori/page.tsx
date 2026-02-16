"use client";

import AdminHeader from "@/components/AdminHeader";
import AdminSkeleton from "@/components/AdminSkeleton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/types";
import { toast } from "sonner";

export default function KelolaKategoriPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete confirmation
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Store last refetch time to avoid excessive refetching
    const [lastRefetchTime, setLastRefetchTime] = useState<number>(0);

    // Track if just returned from another page
    const [justReturned, setJustReturned] = useState(false);

    // Extract fetchCategories as standalone function
    const fetchCategories = async (isInitial = false) => {
        try {
            const response = await categoriesApi.getAll();
            setCategories(response.data || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            // Show error toast only on manual/visibility refetch, not on initial load
            if (!isInitial) {
                toast.error("Gagal memperbarui data kategori");
            }
        } finally {
            if (isInitial) {
                setIsLoading(false);
            }
        }
    };

    // Initial fetch on auth state change
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push("/login");
            return;
        }

        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchCategories(true);
        }
    }, [isAuthenticated, authLoading, router, user?.role]);

    // Auto-refetch when page becomes visible
    useEffect(() => {
        const handleVisibilityChange = async () => {
            // Only refetch when page becomes visible
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                // Debounce: only refetch if at least 5 seconds have passed since last refetch
                if (now - lastRefetchTime > 5000) {
                    setLastRefetchTime(now);
                    await fetchCategories(false);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [lastRefetchTime]);

    // Refetch when component mounts (in case user navigated back from another page)
    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN' && !isLoading && !justReturned) {
            setJustReturned(true);
            // Add slight delay to ensure backend has processed any deletions
            const timer = setTimeout(() => {
                fetchCategories(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, user?.role]);

    const handleTambahKategori = () => {
        setFormMode("add");
        setCategoryName("");
        setDescription("");
        setIsModalOpen(true);
    };

    const handleEdit = (id: string) => {
        const kategori = categories.find(k => k.id === id);
        if (kategori) {
            setFormMode("edit");
            setEditingId(id);
            setCategoryName(kategori.name);
            setDescription(kategori.description || "");
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        const kategori = categories.find(k => k.id === id);
        setDeleteTargetId(id);
        setDeleteTargetName(kategori?.name || "");
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        setErrorMessage(null);
        try {
            await categoriesApi.delete(deleteTargetId);
            setCategories(prev => prev.filter(k => k.id !== deleteTargetId));
            toast.success("Kategori berhasil dihapus");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Gagal menghapus kategori";
            toast.error(msg);
            setErrorMessage(msg);
        } finally {
            setIsDeleting(false);
            setDeleteTargetId(null);
            setDeleteTargetName("");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCategoryName("");
        setDescription("");
        setEditingId(null);
    };

    const handleFormSubmit = async () => {
        if (!categoryName.trim()) {
            toast.error("Harap isi nama kategori!");
            return;
        }

        setIsSubmitting(true);
        try {
            if (formMode === "add") {
                const newCategory = await categoriesApi.create({
                    name: categoryName.trim(),
                    description: description.trim() || undefined,
                });
                setCategories([...categories, newCategory.data]);
                toast.success("Kategori berhasil ditambahkan");
            } else if (editingId) {
                const updatedCategory = await categoriesApi.update(editingId, {
                    name: categoryName.trim(),
                    description: description.trim() || undefined,
                });
                setCategories(categories.map(k => k.id === editingId ? updatedCategory.data : k));
                toast.success("Kategori berhasil diperbarui");
            }
            handleCloseModal();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyimpan kategori");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="admin-dashboard">
                <AdminHeader title="Kategori Buku" subtitle="Kategori" />
                <AdminSkeleton variant="table" columns={5} />
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Kategori Buku" subtitle="Kategori" />

            <div className="admin-content">
                {/* Error Message Banner */}
                {errorMessage && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#dc2626'
                    }}>
                        <span>⚠️ {errorMessage}</span>
                        <button
                            onClick={() => setErrorMessage(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Add Button Row */}
                <div className="data-toolbar justify-end">
                    <button className="btn-tambah" onClick={handleTambahKategori}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Tambah Kategori
                    </button>
                </div>

                {/* Data Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>NO</th>
                                <th>NAMA KATEGORI</th>
                                <th>DESKRIPSI</th>
                                <th>TOTAL BUKU</th>
                                <th style={{ width: "100px" }}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? categories.map((kategori, index) => (
                                <tr key={kategori.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="title-cell">{kategori.name}</td>
                                    <td>{kategori.description || "-"}</td>
                                    <td>
                                        <span className="stok-badge high">{kategori._count?.books ?? kategori.bookCount ?? 0}</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-edit" onClick={() => handleEdit(kategori.id)} title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(kategori.id)} title="Hapus">
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
                                        Tidak ada data kategori
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="data-table-footer">
                        <span>Menampilkan {categories.length} kategori</span>
                    </div>
                </div>

                <footer className="admin-footer">
                    © 2026 YOMU Library System.
                </footer>
            </div>

            {/* Modal Tambah/Edit Kategori */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-kategori" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{formMode === "add" ? "Tambah Kategori Baru" : "Edit Kategori"}</h3>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nama Kategori *</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Novel, Sains, Sejarah"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                                />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    placeholder="Deskripsi kategori (opsional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal-batal" onClick={handleCloseModal}>Batal</button>
                            <button
                                className="btn-modal-simpan-buku"
                                onClick={handleFormSubmit}
                                disabled={isSubmitting}
                                style={{ opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                {isSubmitting ? "Menyimpan..." : formMode === "add" ? "Simpan Kategori" : "Simpan Perubahan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTargetId && (
                <div className="modal-overlay" onClick={() => { setDeleteTargetId(null); setDeleteTargetName(""); }}>
                    <div className="modal-content" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-body" style={{ padding: "2rem", textAlign: "center" }}>
                            <div style={{
                                width: "60px", height: "60px", borderRadius: "50%",
                                background: "#fef2f2", display: "flex", alignItems: "center",
                                justifyContent: "center", margin: "0 auto 1.25rem",
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width="28" height="28">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem", fontWeight: 700, color: "#111827" }}>
                                Hapus Kategori?
                            </h3>
                            <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.5 }}>
                                Anda yakin ingin menghapus kategori <strong style={{ color: "#111827" }}>{deleteTargetName}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
                            </p>
                            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                                <button
                                    onClick={() => { setDeleteTargetId(null); setDeleteTargetName(""); }}
                                    style={{
                                        padding: "0.7rem 1.5rem", background: "#f3f4f6", border: "none",
                                        borderRadius: "0.5rem", fontSize: "0.9rem", fontWeight: 600,
                                        cursor: "pointer", color: "#374151",
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    style={{
                                        padding: "0.7rem 1.5rem", background: "#dc2626", color: "white",
                                        border: "none", borderRadius: "0.5rem", fontSize: "0.9rem",
                                        fontWeight: 600, cursor: isDeleting ? "not-allowed" : "pointer",
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
