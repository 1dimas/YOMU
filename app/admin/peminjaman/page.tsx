"use client";

import AdminHeader from "@/components/AdminHeader";
import AdminSkeleton from "@/components/AdminSkeleton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { loansApi } from "@/lib/api";
import type { Loan, LoanStatus } from "@/types";
import { toast } from "sonner";

type FilterType = "semua" | "aktif" | "terlambat" | "pending";

export default function ManajemenPeminjamanPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>("semua");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push("/login");
            return;
        }

        const fetchLoans = async () => {
            try {
                const response = await loansApi.getAll({});
                setLoans(response.data || []);
            } catch (error) {
                console.error("Failed to fetch loans:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchLoans();
        }
    }, [isAuthenticated, authLoading, router, user?.role]);

    const filteredData = loans.filter((loan) => {
        const matchSearch =
            loan.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loan.book?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loan.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === "aktif") {
            return matchSearch && ["APPROVED", "BORROWED"].includes(loan.status);
        } else if (activeFilter === "terlambat") {
            return matchSearch && loan.status === "OVERDUE";
        } else if (activeFilter === "pending") {
            return matchSearch && ["PENDING", "RETURNING"].includes(loan.status);
        }
        return matchSearch;
    });

    const getStatusBadge = (status: LoanStatus) => {
        const configs: Record<LoanStatus, { label: string; class: string }> = {
            PENDING: { label: "Menunggu Persetujuan", class: "pending" },
            APPROVED: { label: "Disetujui", class: "approved" },
            BORROWED: { label: "Sedang Dipinjam", class: "dipinjam" },
            RETURNING: { label: "Menunggu Verifikasi", class: "returning" },
            RETURNED: { label: "Sudah Kembali", class: "kembali" },
            REJECTED: { label: "Ditolak", class: "rejected" },
            OVERDUE: { label: "Terlambat", class: "terlambat" },
        };
        const config = configs[status] || { label: status, class: "" };
        return <span className={`status-badge-peminjaman ${config.class}`}>{config.label}</span>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getAvatarColor = (name: string) => {
        const colors = ["#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#22c55e", "#06b6d4"];
        const index = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    const getInitials = (name: string) => {
        return (name || "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleOpenModal = (loan: Loan) => {
        setEditingLoan(loan);
        setAdminNotes("");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLoan(null);
        setAdminNotes("");
    };

    const handleApprove = async () => {
        if (!editingLoan) return;
        setIsSubmitting(true);
        try {
            await loansApi.approve(editingLoan.id, adminNotes);
            const response = await loansApi.getAll({});
            setLoans(response.data || []);
            handleCloseModal();
            toast.success("Peminjaman disetujui");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyetujui peminjaman");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!editingLoan) return;
        setIsSubmitting(true);
        try {
            await loansApi.reject(editingLoan.id, adminNotes);
            const response = await loansApi.getAll({});
            setLoans(response.data || []);
            handleCloseModal();
            toast.success("Peminjaman ditolak");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menolak peminjaman");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyReturn = async () => {
        if (!editingLoan) return;
        setIsSubmitting(true);
        try {
            await loansApi.verifyReturn(editingLoan.id, adminNotes);
            const response = await loansApi.getAll({});
            setLoans(response.data || []);
            handleCloseModal();
            toast.success("Pengembalian berhasil diverifikasi");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal memverifikasi pengembalian");
        } finally {
            setIsSubmitting(false);
        }
    };

    const pendingCount = loans.filter(l => l.status === "PENDING").length;
    const returningCount = loans.filter(l => l.status === "RETURNING").length;
    const overdueCount = loans.filter(l => l.status === "OVERDUE").length;

    if (authLoading || isLoading) {
        return (
            <div className="admin-dashboard">
                <AdminHeader title="Manajemen Peminjaman" subtitle="Peminjaman" />
                <AdminSkeleton variant="peminjaman" />
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Manajemen Peminjaman" subtitle="Peminjaman" />

            <div className="admin-content">
                {/* Quick Stats */}
                {(pendingCount > 0 || returningCount > 0 || overdueCount > 0) && (
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                        {pendingCount > 0 && (
                            <div style={{ padding: "1rem", background: "#fef3c7", borderRadius: "0.5rem", flex: 1, minWidth: "200px" }}>
                                <strong>{pendingCount}</strong> permintaan menunggu persetujuan
                            </div>
                        )}
                        {returningCount > 0 && (
                            <div style={{ padding: "1rem", background: "#ddd6fe", borderRadius: "0.5rem", flex: 1, minWidth: "200px" }}>
                                <strong>{returningCount}</strong> menunggu verifikasi pengembalian
                            </div>
                        )}
                        {overdueCount > 0 && (
                            <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "0.5rem", flex: 1, minWidth: "200px" }}>
                                <strong>{overdueCount}</strong> buku terlambat dikembalikan
                            </div>
                        )}
                    </div>
                )}

                {/* Filter and Search Row */}
                <div className="peminjaman-toolbar">
                    <div className="filter-tabs">
                        <button className={`filter-tab ${activeFilter === "semua" ? "active" : ""}`} onClick={() => setActiveFilter("semua")}>
                            Semua ({loans.length})
                        </button>
                        <button className={`filter-tab ${activeFilter === "pending" ? "active" : ""}`} onClick={() => setActiveFilter("pending")}>
                            Pending ({pendingCount + returningCount})
                        </button>
                        <button className={`filter-tab aktif ${activeFilter === "aktif" ? "active" : ""}`} onClick={() => setActiveFilter("aktif")}>
                            Aktif
                        </button>
                        <button className={`filter-tab terlambat ${activeFilter === "terlambat" ? "active" : ""}`} onClick={() => setActiveFilter("terlambat")}>
                            Terlambat ({overdueCount})
                        </button>
                    </div>

                    <div className="data-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari nama siswa atau judul buku..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="data-table-container">
                    <table className="data-table peminjaman-table">
                        <thead>
                            <tr>
                                <th>ID TRANSAKSI</th>
                                <th>NAMA SISWA</th>
                                <th>JUDUL BUKU</th>
                                <th>TGL PINJAM</th>
                                <th>TENGGAT KEMBALI</th>
                                <th>STATUS</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((loan) => (
                                <tr key={loan.id}>
                                    <td className="id-cell">#{loan.id.slice(-6).toUpperCase()}</td>
                                    <td>
                                        <div className="member-info-cell">
                                            <div className="member-avatar" style={{ backgroundColor: getAvatarColor(loan.user?.name || "") }}>
                                                {getInitials(loan.user?.name || "User")}
                                            </div>
                                            <span className="member-name">{loan.user?.name || "User"}</span>
                                        </div>
                                    </td>
                                    <td>{loan.book?.title || "Buku"}</td>
                                    <td>{formatDate(loan.loanDate)}</td>
                                    <td className={loan.status === "OVERDUE" ? "text-red" : ""}>{formatDate(loan.dueDate)}</td>
                                    <td>{getStatusBadge(loan.status)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {["PENDING", "RETURNING"].includes(loan.status) && (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleOpenModal(loan)}
                                                    title="Proses"
                                                    style={{ background: "#10b981", color: "white" }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </button>
                                            )}
                                            {loan.status !== "PENDING" && (
                                                <button className="btn-action message" onClick={() => router.push("/admin/pesan")} title="Pesan">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                                        Tidak ada data peminjaman
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="data-table-footer">
                        <span>Menampilkan {filteredData.length} dari {loans.length} data</span>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="tips-card">
                    <div className="tips-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </div>
                    <div className="tips-content">
                        <h4>Tips Admin</h4>
                        <p>Segera proses permintaan di tab Pending untuk memberikan pelayanan terbaik.</p>
                    </div>
                </div>

                <footer className="admin-footer">
                    © 2026 YOMU Library System.
                </footer>
            </div>

            {/* Modal Approve/Reject/Verify */}
            {isModalOpen && editingLoan && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-peminjaman" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {editingLoan.status === "PENDING" && "Proses Permintaan Peminjaman"}
                                {editingLoan.status === "RETURNING" && "Verifikasi Pengembalian"}
                            </h3>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="peminjaman-info">
                                <div className="info-row">
                                    <span className="info-label">NAMA SISWA</span>
                                    <span className="info-value">{editingLoan.user?.name || "User"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">JUDUL BUKU</span>
                                    <span className="info-value">{editingLoan.book?.title || "Buku"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">TANGGAL PINJAM</span>
                                    <span className="info-value">{formatDate(editingLoan.loanDate)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">TENGGAT KEMBALI</span>
                                    <span className="info-value">{formatDate(editingLoan.dueDate)}</span>
                                </div>
                                {editingLoan.returnCondition && (
                                    <div className="info-row">
                                        <span className="info-label">KONDISI BUKU</span>
                                        <span className="info-value" style={{
                                            color: editingLoan.returnCondition === 'GOOD' ? '#10b981' : '#f59e0b'
                                        }}>
                                            {editingLoan.returnCondition === 'GOOD' ? 'Baik' : 'Rusak'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Catatan Admin (opsional)</label>
                                <textarea
                                    placeholder="Tambahkan catatan..."
                                    rows={3}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            {editingLoan.status === "PENDING" && (
                                <>
                                    <button
                                        className="btn-modal-batal"
                                        onClick={handleReject}
                                        disabled={isSubmitting}
                                        style={{ background: "#fee2e2", color: "#dc2626", border: "none" }}
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        className="btn-modal-simpan"
                                        onClick={handleApprove}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Memproses..." : "Setujui Peminjaman"}
                                    </button>
                                </>
                            )}
                            {editingLoan.status === "RETURNING" && (
                                <>
                                    <button className="btn-modal-batal" onClick={handleCloseModal}>Batal</button>
                                    <button
                                        className="btn-modal-simpan"
                                        onClick={handleVerifyReturn}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Memproses..." : "Verifikasi Pengembalian"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
