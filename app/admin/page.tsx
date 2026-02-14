"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { useAuth } from "@/lib/auth-context";
import { statsApi, loansApi } from "@/lib/api";
import type { AdminStats, Loan } from "@/types";

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Auth check - must be admin
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [statsRes, loansRes] = await Promise.all([
                    statsApi.getAdmin(),
                    loansApi.getAll({ limit: 5 }),
                ]);
                setStats(statsRes.data);
                setRecentLoans(loansRes.data || []);
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchData();
        }
    }, [isAuthenticated, authLoading, router, user?.role]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PENDING: "Menunggu",
            APPROVED: "Disetujui",
            BORROWED: "Dipinjam",
            RETURNING: "Pengembalian",
            RETURNED: "Kembali",
            REJECTED: "Ditolak",
            OVERDUE: "Terlambat",
        };
        return labels[status] || status;
    };

    const getStatusClass = (status: string) => {
        const classes: Record<string, string> = {
            PENDING: "warning",
            APPROVED: "success",
            BORROWED: "dipinjam",
            RETURNING: "warning",
            RETURNED: "kembali",
            REJECTED: "danger",
            OVERDUE: "terlambat",
        };
        return classes[status] || "";
    };

    const getAvatarColor = (name: string) => {
        const colors = ["#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#22c55e", "#06b6d4"];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (authLoading || isLoading) {
        return (
            <div className="admin-dashboard">
                <AdminHeader title="Dashboard Overview" subtitle="Dashboard" />
                <div className="admin-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                    <p>Memuat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Dashboard Overview" subtitle="Dashboard" />

            <div className="admin-content">
                {/* Welcome Card */}
                <div className="admin-welcome-card">
                    <h2>Selamat Datang kembali, {user?.name || "Admin"}!</h2>
                    <p>
                        Sistem perpustakaan berjalan lancar hari ini. Ada <strong>{stats?.loans?.pending || 0} permintaan</strong> yang
                        perlu diproses dan <strong>{stats?.loans?.overdue || 0} buku</strong> yang terlambat dikembalikan.
                    </p>
                    <Link href="/admin/laporan" className="btn-laporan">
                        Lihat Laporan Harian
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="admin-stats-row">
                    {/* Total Judul Buku */}
                    <div className="admin-stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Total Judul Buku</span>
                            <span className="stat-value">{stats?.books?.total?.toLocaleString() || 0}</span>
                            <span className="stat-change positive">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                                {stats?.books?.available || 0} tersedia
                            </span>
                        </div>
                        <div className="stat-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        </div>
                    </div>

                    {/* Buku Sedang Dipinjam */}
                    <div className="admin-stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Buku Sedang Dipinjam</span>
                            <span className="stat-value">{stats?.loans?.active || 0}</span>
                            <span className="stat-change warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {stats?.loans?.overdue || 0} terlambat
                            </span>
                        </div>
                        <div className="stat-icon orange">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                    </div>

                    {/* Jumlah Anggota */}
                    <div className="admin-stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Jumlah Anggota</span>
                            <span className="stat-value">{stats?.users?.total || 0}</span>
                            <span className="stat-change positive blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                                +{stats?.users?.newThisMonth || 0} anggota baru bulan ini
                            </span>
                        </div>
                        <div className="stat-icon blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="admin-table-container">
                    <div className="table-header">
                        <div className="table-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3>Transaksi Terakhir</h3>
                        </div>
                        <Link href="/admin/peminjaman" className="table-link">
                            Lihat Semua
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </Link>
                    </div>

                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID TRANSAKSI</th>
                                <th>NAMA ANGGOTA</th>
                                <th>JUDUL BUKU</th>
                                <th>TANGGAL PINJAM</th>
                                <th>STATUS</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLoans.length > 0 ? recentLoans.map((loan) => (
                                <tr key={loan.id}>
                                    <td className="id-cell">#{loan.id.slice(-6).toUpperCase()}</td>
                                    <td>
                                        <div className="member-cell">
                                            <div className="member-avatar" style={{ backgroundColor: getAvatarColor(loan.user?.name || "U") }}>
                                                {getInitials(loan.user?.name || "User")}
                                            </div>
                                            <span>{loan.user?.name || "User"}</span>
                                        </div>
                                    </td>
                                    <td>{loan.book?.title || "Buku"}</td>
                                    <td className="date-cell">{formatDate(loan.loanDate)}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(loan.status)}`}>
                                            <span className="status-dot"></span>
                                            {getStatusLabel(loan.status)}
                                        </span>
                                    </td>
                                    <td className="action-cell">
                                        <Link href={`/admin/peminjaman?id=${loan.id}`} className="action-btn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                                        Belum ada transaksi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="table-footer">
                        <span>Menampilkan {recentLoans.length} transaksi terbaru</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
