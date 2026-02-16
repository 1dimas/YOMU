"use client";

import AdminHeader from "@/components/AdminHeader";
import AdminSkeleton from "@/components/AdminSkeleton";
import ConfirmModal from "@/components/ConfirmModal";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { booksApi, categoriesApi } from "@/lib/api";
import type { Book, Category } from "@/types";
import { toast } from "sonner";

export default function DataBukuPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        publisher: "",
        year: new Date().getFullYear(),
        categoryId: "",
        totalStock: 0,
        isbn: "",
        synopsis: "",
    });
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Confirm delete modal state
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [booksRes, catRes] = await Promise.all([
                    booksApi.getAll({}),
                    categoriesApi.getAll(),
                ]);
                setBooks(booksRes.data || []);
                setCategories(catRes.data || []);
            } catch (error) {
                console.error("Failed to fetch books:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchData();
        }
    }, [isAuthenticated, authLoading, router, user?.role]);

    const filteredBooks = books.filter(
        (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTambahBuku = () => {
        setFormMode("add");
        setFormData({
            title: "",
            author: "",
            publisher: "",
            year: new Date().getFullYear(),
            categoryId: "",
            totalStock: 0,
            isbn: "",
            synopsis: "",
        });
        setCoverPreview(null);
        setIsModalOpen(true);
    };

    const handleEdit = (id: string) => {
        const book = books.find(b => b.id === id);
        if (book) {
            setFormMode("edit");
            setEditingId(id);
            setFormData({
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                year: book.year,
                categoryId: book.categoryId || "",
                totalStock: book.totalStock,
                isbn: book.isbn,
                synopsis: book.synopsis || "",
            });
            setCoverPreview(book.coverUrl || null);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await booksApi.delete(confirmDeleteId);
            setBooks((prevBooks) => prevBooks.filter(b => b.id !== confirmDeleteId));
            
            // Refetch categories to update book counts
            try {
                const catRes = await categoriesApi.getAll();
                setCategories(catRes.data || []);
            } catch (error) {
                console.error("Failed to refetch categories:", error);
            }
            
            toast.success("Buku berhasil dihapus");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus buku");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            title: "",
            author: "",
            publisher: "",
            year: new Date().getFullYear(),
            categoryId: "",
            totalStock: 0,
            isbn: "",
            synopsis: "",
        });
        setCoverPreview(null);
        setEditingId(null);
    };

    const handleFormSubmit = async () => {
        if (!formData.title || !formData.author) {
            toast.error("Harap isi judul dan pengarang buku!");
            return;
        }

        setIsSubmitting(true);
        try {
            if (formMode === "add") {
                const newBook = await booksApi.create({
                    title: formData.title,
                    author: formData.author,
                    publisher: formData.publisher,
                    year: formData.year,
                    categoryId: formData.categoryId || undefined,
                    stock: formData.totalStock,
                    isbn: formData.isbn,
                    synopsis: formData.synopsis,
                    coverUrl: coverPreview || undefined,
                });

                setBooks([...books, newBook.data]);
                toast.success("Buku berhasil ditambahkan");
            } else if (editingId) {
                const updatedBook = await booksApi.update(editingId, {
                    title: formData.title,
                    author: formData.author,
                    publisher: formData.publisher,
                    year: formData.year,
                    categoryId: formData.categoryId || undefined,
                    stock: formData.totalStock,
                    isbn: formData.isbn,
                    synopsis: formData.synopsis,
                    coverUrl: coverPreview || undefined,
                });

                setBooks(books.map(b => b.id === editingId ? updatedBook.data : b));
                toast.success("Buku berhasil diperbarui");
            }
            handleCloseModal();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyimpan buku");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 2MB!");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDropZoneClick = () => {
        fileInputRef.current?.click();
    };

    if (authLoading || isLoading) {
        return (
            <div className="admin-dashboard">
                <AdminHeader title="Manajemen Data Buku" subtitle="Data Buku" />
                <AdminSkeleton variant="table" columns={6} />
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Manajemen Data Buku" subtitle="Data Buku" />

            <div className="admin-content">
                {/* Search and Add Button Row */}
                <div className="data-toolbar">
                    <div className="data-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul buku..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn-tambah" onClick={handleTambahBuku}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Tambah Buku Baru
                    </button>
                </div>

                {/* Data Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID BUKU</th>
                                <th>JUDUL BUKU</th>
                                <th>PENGARANG</th>
                                <th>KATEGORI</th>
                                <th>STOK TERSEDIA</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.length > 0 ? filteredBooks.map((book) => (
                                <tr key={book.id}>
                                    <td className="id-cell">#{book.id.slice(-6).toUpperCase()}</td>
                                    <td className="title-cell">{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.category?.name || "-"}</td>
                                    <td>
                                        <span className={`stok-badge ${book.availableStock <= 5 ? "low" : book.availableStock <= 10 ? "medium" : "high"}`}>
                                            {book.availableStock} / {book.totalStock}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-edit" onClick={() => handleEdit(book.id)} title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(book.id)} title="Hapus">
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
                                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                                        Tidak ada data buku
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="data-table-footer">
                        <span>Menampilkan {filteredBooks.length} dari {books.length} buku</span>
                    </div>
                </div>

                <footer className="admin-footer">
                    © 2026 YOMU Library System.
                </footer>
            </div>

            {/* Modal Tambah/Edit Buku */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-buku" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{formMode === "add" ? "Tambah Buku Baru" : "Edit Data Buku"}</h3>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body modal-buku-body">
                            <div className="modal-buku-left">
                                <div className="form-group">
                                    <label>Judul Buku *</label>
                                    <input type="text" placeholder="Masukkan judul lengkap buku" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Penulis/Pengarang *</label>
                                        <input type="text" placeholder="Nama penulis" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Penerbit</label>
                                        <input type="text" placeholder="Nama penerbit" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row form-row-3">
                                    <div className="form-group">
                                        <label>Tahun Terbit</label>
                                        <input type="number" placeholder="2023" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Kategori</label>
                                        <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                                            <option value="">Pilih Kategori</option>
                                            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Stok Buku</label>
                                        <input type="number" placeholder="0" value={formData.totalStock} onChange={(e) => setFormData({ ...formData, totalStock: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Kode Buku / ISBN</label>
                                    <input type="text" placeholder="Contoh: 978-602-1234-56-7" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Sinopsis / Deskripsi</label>
                                    <textarea placeholder="Tuliskan ringkasan isi buku..." rows={4} value={formData.synopsis} onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-buku-right">
                                <label className="upload-label">Upload Cover Buku</label>
                                <div className="upload-dropzone" onClick={handleDropZoneClick}>
                                    <input type="file" ref={fileInputRef} accept="image/jpeg,image/png" onChange={handleFileChange} style={{ display: "none" }} />
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="Cover Preview" className="cover-preview" />
                                    ) : (
                                        <>
                                            <div className="upload-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                            </div>
                                            <p className="upload-text">Klik atau drag file ke sini</p>
                                            <p className="upload-hint">Format: JPG, PNG (Max. 2MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal-batal" onClick={handleCloseModal}>Batal</button>
                            <button
                                className="btn-modal-simpan"
                                onClick={handleFormSubmit}
                                disabled={isSubmitting}
                                style={{ opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                {isSubmitting ? "Menyimpan..." : formMode === "add" ? "Simpan Buku" : "Simpan Perubahan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!confirmDeleteId}
                title="Hapus Buku"
                message="Apakah Anda yakin ingin menghapus buku ini? Data buku yang dihapus tidak dapat dikembalikan."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}
