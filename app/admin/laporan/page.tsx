"use client";

import AdminHeader from "@/components/AdminHeader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { reportsApi } from "@/lib/api";
import type { Loan } from "@/types";
import { toast } from "sonner";

export default function LaporanTransaksiPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const response = await reportsApi.getLoans({
                    status: filterStatus !== "all" ? filterStatus : undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                });
                setLoans(response.data || []);
            } catch (error) {
                console.error("Failed to fetch report:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchData();
        }
    }, [isAuthenticated, authLoading, router, user?.role, filterStatus, startDate, endDate]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getAvatarColor = (name: string) => {
        const colors = ["#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#22c55e", "#06b6d4"];
        return colors[(name?.charCodeAt(0) || 0) % colors.length];
    };

    const getInitials = (name: string) => {
        return (name || "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PENDING: "Menunggu",
            APPROVED: "Disetujui",
            BORROWED: "Sedang Dipinjam",
            RETURNING: "Pengembalian",
            RETURNED: "Sudah Kembali",
            REJECTED: "Ditolak",
            OVERDUE: "Terlambat",
        };
        return labels[status] || status;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        try {
            const blob = await reportsApi.exportLoansPDF({
                status: filterStatus !== "all" ? filterStatus : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `laporan-peminjaman-${new Date().toISOString().slice(0, 10)}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Laporan berhasil diexport");
        } catch {
            toast.error("Gagal mengeksport PDF");
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="admin-dashboard">
                <AdminHeader title="Laporan Peminjaman" subtitle="Laporan" />
                <div className="admin-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                    <p>Memuat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Laporan Peminjaman" subtitle="Laporan" />

            <div className="admin-content">
                {/* Filter Row */}
                <div className="filter-toolbar">
                    <div className="filter-group">
                        <span className="filter-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                            Filter:
                        </span>
                        <input
                            type="date"
                            className="filter-select"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span>-</span>
                        <input
                            type="date"
                            className="filter-select"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="BORROWED">Sedang Dipinjam</option>
                            <option value="RETURNED">Sudah Kembali</option>
                            <option value="OVERDUE">Terlambat</option>
                        </select>
                    </div>
                    <div className="export-actions">
                        <button className="btn-print" onClick={handlePrint}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Print
                        </button>
                        <button className="btn-export" onClick={handleExportPDF}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="data-table-container">
                    <table className="data-table laporan-table">
                        <thead>
                            <tr>
                                <th>NAMA SISWA</th>
                                <th>JUDUL BUKU</th>
                                <th>TANGGAL PINJAM</th>
                                <th>TANGGAL KEMBALI</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.length > 0 ? loans.map((loan) => (
                                <tr key={loan.id}>
                                    <td>
                                        <div className="member-info-cell">
                                            <div className="member-avatar" style={{ backgroundColor: getAvatarColor(loan.user?.name || "") }}>
                                                {getInitials(loan.user?.name || "User")}
                                            </div>
                                            <div className="member-details">
                                                <span className="member-name">{loan.user?.name || "User"}</span>
                                                <span className="member-email">{loan.user?.class?.name && loan.user?.major?.name ? `${loan.user.class.name} ${loan.user.major.name}` : loan.user?.class?.name || loan.user?.major?.name || "-"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="title-cell">{loan.book?.title || "Buku"}</td>
                                    <td>{formatDate(loan.loanDate)}</td>
                                    <td>{loan.returnDate ? formatDate(loan.returnDate) : "-"}</td>
                                    <td>
                                        <span className={`status-badge-laporan ${loan.status === "RETURNED" ? "kembali" : "dipinjam"}`}>
                                            <span className="status-icon">
                                                {loan.status === "RETURNED" ? (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22 4 12 14.01 9 11.01" />
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                )}
                                            </span>
                                            {getStatusLabel(loan.status)}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                                        Tidak ada data transaksi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="data-table-footer">
                        <span>Menampilkan {loans.length} transaksi</span>
                    </div>
                </div>

                <footer className="admin-footer">
                    © 2026 YOMU Library System.
                </footer>
            </div>
        </div>
    );
}
