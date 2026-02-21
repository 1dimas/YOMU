"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { loansApi } from "@/lib/api";
import type { Loan, LoanStatus } from "@/types";
import { BookCondition } from "@/types";
import { toast } from "sonner";
import SiswaSkeleton from "@/components/SiswaSkeleton";

// Cover gradients for books without covers
const coverGradients = [
    "linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)",
    "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)",
    "linear-gradient(135deg, #68d391 0%, #48bb78 100%)",
    "linear-gradient(135deg, #90cdf4 0%, #63b3ed 100%)",
    "linear-gradient(135deg, #fc8181 0%, #f56565 100%)",
    "linear-gradient(135deg, #b794f4 0%, #9f7aea 100%)",
];

type FilterType = "semua" | "aktif" | "selesai";

export default function PeminjamanPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("semua");
    const [showReturnModal, setShowReturnModal] = useState<string | null>(null);
    const [selectedCondition, setSelectedCondition] = useState<BookCondition>(BookCondition.GOOD);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        const fetchLoans = async () => {
            try {
                const response = await loansApi.getMy({});
                setLoans(response.data || []);
            } catch (error) {
                console.error("Failed to fetch loans:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchLoans();
        }
    }, [isAuthenticated, authLoading, router]);

    const filteredLoans = loans.filter((loan) => {
        if (filter === "semua") return true;
        if (filter === "aktif") {
            return ["PENDING", "APPROVED", "BORROWED", "RETURNING", "OVERDUE"].includes(loan.status);
        }
        return ["RETURNED", "REJECTED"].includes(loan.status);
    });

    const handleKembalikan = async () => {
        if (!showReturnModal) return;
        setIsSubmitting(true);
        try {
            await loansApi.requestReturn(showReturnModal, selectedCondition);
            // Refresh loans
            const response = await loansApi.getMy({});
            setLoans(response.data || []);
            setShowReturnModal(null);
            if (selectedCondition === BookCondition.GOOD) {
                toast.success("Buku berhasil dikembalikan!");
            } else {
                toast.success("Permintaan pengembalian dikirim. Menunggu verifikasi admin.");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengembalikan buku");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getDaysRemaining = (dateStr: string) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dueDate = new Date(dateStr);
        const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatusLabel = (status: LoanStatus) => {
        const labels: Record<LoanStatus, string> = {
            PENDING: "Menunggu Persetujuan",
            APPROVED: "Disetujui",
            BORROWED: "Sedang Dipinjam",
            RETURNING: "Menunggu Verifikasi",
            RETURNED: "Dikembalikan",
            REJECTED: "Ditolak",
            OVERDUE: "Terlambat",
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: LoanStatus) => {
        const colors: Record<LoanStatus, string> = {
            PENDING: "#f59e0b",
            APPROVED: "#10b981",
            BORROWED: "#3b82f6",
            RETURNING: "#8b5cf6",
            RETURNED: "#6b7280",
            REJECTED: "#ef4444",
            OVERDUE: "#dc2626",
        };
        return colors[status] || "#6b7280";
    };

    const activeLoans = loans.filter(l => ["PENDING", "APPROVED", "BORROWED", "OVERDUE"].includes(l.status));
    const returnedLoans = loans.filter(l => ["RETURNED", "REJECTED"].includes(l.status));
    const nearDueLoans = loans.filter(l =>
        (l.status === "BORROWED" && getDaysRemaining(l.dueDate) <= 3) ||
        l.status === "OVERDUE"
    );

    if (authLoading || isLoading) {
        return <SiswaSkeleton variant="peminjaman" />;
    }

    return (
        <div className="dashboard-content" style={{ paddingBottom: '4rem' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                        Peminjaman Saya
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                        Kelola dan pantau status peminjaman buku perpustakaan.
                    </p>
                </div>
                <Link
                    href="/siswa/pesan"
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Pesan
                </Link>
                <style jsx global>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>

            {/* Stats Summary - New Grid Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px'
                }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Sedang Dipinjam</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#3b82f6', lineHeight: 1 }}>{activeLoans.length}</div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#eff6ff',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-end',
                        marginTop: '-2rem'
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" width="20" height="20">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px'
                }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Selesai / Kembali</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#10b981', lineHeight: 1 }}>{returnedLoans.length}</div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#ecfdf5',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-end',
                        marginTop: '-2rem'
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="20" height="20">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {nearDueLoans.length > 0 && <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: nearDueLoans.some(l => l.status === 'OVERDUE') ? '#ef4444' : '#f59e0b' }} />}
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Hampir / Jatuh Tempo</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: nearDueLoans.length > 0 ? (nearDueLoans.some(l => l.status === 'OVERDUE') ? '#ef4444' : '#f59e0b') : '#9ca3af', lineHeight: 1 }}>
                            {nearDueLoans.length}
                        </div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: nearDueLoans.length > 0 ? '#fffbeb' : '#f3f4f6',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-end',
                        marginTop: '-2rem'
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={nearDueLoans.length > 0 ? "#f59e0b" : "#9ca3af"} strokeWidth="2" width="20" height="20">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Filter Tabs - Modern Pills */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem',
                overflowX: 'auto',
                scrollbarWidth: 'none'
            }}>
                <button
                    onClick={() => setFilter("semua")}
                    style={{
                        padding: '0.625rem 1.25rem',
                        borderRadius: '9999px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        border: filter === "semua" ? 'none' : '1px solid #e5e7eb',
                        background: filter === "semua" ? '#111827' : 'white',
                        color: filter === "semua" ? 'white' : '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Semua
                </button>
                <button
                    onClick={() => setFilter("aktif")}
                    style={{
                        padding: '0.625rem 1.25rem',
                        borderRadius: '9999px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        border: filter === "aktif" ? 'none' : '1px solid #e5e7eb',
                        background: filter === "aktif" ? '#111827' : 'white',
                        color: filter === "aktif" ? 'white' : '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Aktif
                </button>
                <button
                    onClick={() => setFilter("selesai")}
                    style={{
                        padding: '0.625rem 1.25rem',
                        borderRadius: '9999px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        border: filter === "selesai" ? 'none' : '1px solid #e5e7eb',
                        background: filter === "selesai" ? '#111827' : 'white',
                        color: filter === "selesai" ? 'white' : '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Selesai
                </button>
            </div>

            {/* Peminjaman List - Modern Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredLoans.map((loan, index) => (
                    <div
                        key={loan.id}
                        style={{
                            background: 'white',
                            borderRadius: '1rem',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            overflow: 'hidden',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div style={{ display: 'flex', padding: '1rem', gap: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '110px',
                                    borderRadius: '0.5rem',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: loan.book?.coverUrl ? 'none' : coverGradients[index % coverGradients.length],
                                    position: 'relative'
                                }}
                            >
                                {loan.book?.coverUrl ? (
                                    <img
                                        src={loan.book.coverUrl}
                                        alt={loan.book.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1.5rem',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        {loan.book?.title?.charAt(0) || "B"}
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignSelf: 'flex-start',
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        background: `${getStatusColor(loan.status)}15`,
                                        color: getStatusColor(loan.status),
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    {getStatusLabel(loan.status)}
                                </div>
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    color: '#111827',
                                    marginBottom: '0.25rem',
                                    lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {loan.book?.title || "Judul Buku"}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {loan.book?.author || "Penulis Tidak Diketahui"}
                                </p>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: '#f9fafb', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: '#6b7280' }}>Tanggal Pinjam</span>
                                <span style={{ fontWeight: '600', color: '#374151' }}>{formatDate(loan.loanDate)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: '#6b7280' }}>Tenggat Waktu</span>
                                <span style={{ fontWeight: '600', color: '#374151' }}>{formatDate(loan.dueDate)}</span>
                            </div>

                            {/* Dynamic Action Area */}
                            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                                {loan.status === "BORROWED" && (() => {
                                    const daysLeft = getDaysRemaining(loan.dueDate);
                                    const canReturn = daysLeft <= 0;

                                    return (
                                        <>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '1rem',
                                                padding: '0.5rem',
                                                background: !canReturn ? (daysLeft <= 3 ? '#fffbeb' : '#f0f4ff') : '#ecfdf5',
                                                borderRadius: '0.5rem',
                                                color: !canReturn ? (daysLeft <= 3 ? '#b45309' : '#3b82f6') : '#059669',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                {canReturn
                                                    ? 'Sudah bisa dikembalikan'
                                                    : `Bisa dikembalikan dalam ${daysLeft} hari`}
                                            </div>
                                            <button
                                                onClick={() => canReturn && setShowReturnModal(loan.id)}
                                                disabled={!canReturn}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: canReturn ? '#2563eb' : '#94a3b8',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    fontWeight: '600',
                                                    cursor: canReturn ? 'pointer' : 'not-allowed',
                                                    fontSize: '0.95rem',
                                                    transition: 'background 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    opacity: canReturn ? 1 : 0.7
                                                }}
                                                onMouseOver={(e) => canReturn && (e.currentTarget.style.background = '#1d4ed8')}
                                                onMouseOut={(e) => canReturn && (e.currentTarget.style.background = '#2563eb')}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                    <path d="M9 14l-4-4 4-4" />
                                                    <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
                                                </svg>
                                                {canReturn ? 'Kembalikan Buku' : `Tunggu ${daysLeft} hari lagi`}
                                            </button>
                                        </>
                                    );
                                })()}
                                {loan.status === "OVERDUE" && (
                                    <>
                                        <div style={{
                                            marginBottom: '1rem',
                                            padding: '0.5rem',
                                            background: '#fef2f2',
                                            borderRadius: '0.5rem',
                                            color: '#b91c1c',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            border: '1px solid #fecaca'
                                        }}>
                                            Terlambat Pengembalian!
                                        </div>
                                        <button
                                            onClick={() => setShowReturnModal(loan.id)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                fontSize: '0.95rem',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                <path d="M9 14l-4-4 4-4" />
                                                <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
                                            </svg>
                                            Kembalikan Segera
                                        </button>
                                    </>
                                )}
                                {loan.status === "RETURNED" && (
                                    <div style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#f3f4f6',
                                        color: '#6b7280',
                                        borderRadius: '0.5rem',
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Buku Telah Dikembalikan
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredLoans.length === 0 && (
                <div style={{
                    marginTop: '3rem',
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '1.5rem',
                    border: '2px dashed #e5e7eb'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#f9fafb',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: '#9ca3af'
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                        Belum ada riwayat peminjaman
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', marginInline: 'auto' }}>
                        Kamu belum meminjam buku apapun dengan filter ini. Yuk cari buku menarik di katalog!
                    </p>
                    <Link
                        href="/siswa/katalog"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 2rem',
                            background: '#111827',
                            color: 'white',
                            borderRadius: '9999px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Jelajahi Katalog
                    </Link>
                </div>
            )}

            {/* Return Book Modal - Improved UI */}
            {showReturnModal && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    onClick={() => setShowReturnModal(null)}
                >
                    <style jsx>{`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideUp {
                            from { transform: translateY(20px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `}</style>
                    <div
                        className="modal-content"
                        style={{
                            background: 'white',
                            padding: '0',
                            borderRadius: '1.5rem',
                            maxWidth: '420px',
                            width: '90%',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: '2rem 2rem 1.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: '#eff6ff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" width="32" height="32">
                                    <path d="M9 14l-4-4 4-4" />
                                    <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
                                </svg>
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.5rem', textAlign: 'center', fontWeight: '800', color: '#111827' }}>
                                Kembalikan Buku
                            </h3>
                            <p style={{ color: '#6b7280', marginBottom: '2rem', textAlign: 'center', lineHeight: 1.6 }}>
                                Pilih kondisi buku saat ini. Buku dalam kondisi baik akan langsung dikembalikan, sedangkan buku rusak atau hilang akan diverifikasi oleh admin.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                {[
                                    { value: BookCondition.GOOD, label: 'Kondisi Baik', desc: 'Buku dalam keadaan utuh, bersih, dan layak dipinjamkan kembali.', color: '#10b981', bg: '#ecfdf5' },
                                    { value: BookCondition.DAMAGED, label: 'Kondisi Rusak', desc: 'Buku mengalami kerusakan seperti halaman sobek, basah, atau kotor.', color: '#f59e0b', bg: '#fffbeb' },
                                    { value: BookCondition.LOST, label: 'Buku Hilang', desc: 'Buku tidak dapat ditemukan atau hilang selama masa peminjaman.', color: '#ef4444', bg: '#fef2f2' },
                                ].map(opt => (
                                    <label
                                        key={opt.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1.25rem',
                                            border: selectedCondition === opt.value ? `2px solid ${opt.color}` : '1px solid #e5e7eb',
                                            borderRadius: '1rem',
                                            cursor: 'pointer',
                                            background: selectedCondition === opt.value ? opt.bg : 'white',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: selectedCondition === opt.value ? `6px solid ${opt.color}` : '2px solid #d1d5db',
                                            background: 'white',
                                            flexShrink: 0,
                                            transition: 'all 0.2s'
                                        }}></div>
                                        <input
                                            type="radio"
                                            name="condition"
                                            value={opt.value}
                                            checked={selectedCondition === opt.value}
                                            onChange={() => setSelectedCondition(opt.value)}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>{opt.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.4 }}>{opt.desc}</div>
                                        </div>
                                        {selectedCondition === opt.value && (
                                            <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke={opt.color} strokeWidth="3" width="20" height="20">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            background: '#f9fafb',
                            display: 'flex',
                            gap: '1rem',
                            borderTop: '1px solid #f3f4f6'
                        }}>
                            <button
                                onClick={() => setShowReturnModal(null)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.75rem',
                                    background: 'white',
                                    color: '#4b5563',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleKembalikan}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    background: '#2563eb',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1,
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loader" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                                        Memproses...
                                    </>
                                ) : 'Konfirmasi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
