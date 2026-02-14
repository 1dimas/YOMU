"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { booksApi, favoritesApi, loansApi, reviewsApi } from "@/lib/api";
import type { Book } from "@/types";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { toast } from "sonner";

const coverGradients = [
    "linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)",
    "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)",
    "linear-gradient(135deg, #68d391 0%, #48bb78 100%)",
    "linear-gradient(135deg, #90cdf4 0%, #63b3ed 100%)",
    "linear-gradient(135deg, #fc8181 0%, #f56565 100%)",
    "linear-gradient(135deg, #b794f4 0%, #9f7aea 100%)",
];

function DetailBukuContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookId = searchParams.get("id");
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [book, setBook] = useState<Book | null>(null);
    const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasActiveLoan, setHasActiveLoan] = useState(false);
    const [loanStatus, setLoanStatus] = useState<string | null>(null);

    const [isLoanPopupOpen, setIsLoanPopupOpen] = useState(false);
    const [loanDuration, setLoanDuration] = useState(7);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const fetchBook = useCallback(async () => {
        if (!bookId) return;
        try {
            const [bookRes, favoriteCheck, myLoansRes] = await Promise.all([
                booksApi.getById(bookId),
                favoritesApi.check(bookId).catch(() => ({ data: { isFavorite: false } })),
                loansApi.getMy({}).catch(() => ({ data: [] })),
            ]);

            setBook(bookRes.data);
            setIsFavorite(favoriteCheck.data.isFavorite);

            const activeLoan = (myLoansRes.data || []).find(
                (loan: any) => loan.bookId === bookId &&
                    ['PENDING', 'APPROVED', 'BORROWED', 'OVERDUE'].includes(loan.status)
            );
            if (activeLoan) {
                setHasActiveLoan(true);
                setLoanStatus(activeLoan.status);
            } else {
                setHasActiveLoan(false);
                setLoanStatus(null);
            }

            if (bookRes.data.categoryId) {
                const similarRes = await booksApi.getAll({ categoryId: bookRes.data.categoryId, limit: 4 });
                setSimilarBooks(similarRes.data?.filter(b => b.id !== bookId) || []);
            }

            const reviewsRes = await reviewsApi.getByBookId(bookId);
            setRatingStats(reviewsRes.data.stats);
        } catch (error) {
            console.error("Failed to fetch book:", error);
            router.push("/siswa/katalog");
        } finally {
            setIsLoading(false);
        }
    }, [bookId, router]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) { router.push("/login"); return; }
        if (!bookId) { router.push("/siswa/katalog"); return; }
        if (isAuthenticated) fetchBook();
    }, [bookId, isAuthenticated, authLoading, router, fetchBook]);

    const handlePinjam = () => {
        if (!book) return;
        setIsLoanPopupOpen(true);
        setLoanDuration(7);
        setTermsAccepted(false);
    };

    const confirmPinjam = async () => {
        if (!book || !termsAccepted) return;
        setIsSubmitting(true);
        try {
            await loansApi.create(book.id, loanDuration);
            setIsLoanPopupOpen(false);
            toast.success("Permintaan peminjaman berhasil dikirim! Tunggu persetujuan admin.");
            setHasActiveLoan(true);
            setLoanStatus('PENDING');
            await fetchBook();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal meminjam buku";
            toast.error(message);
            if (message.includes("already have")) setIsLoanPopupOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!book) return;
        try {
            if (isFavorite) {
                await favoritesApi.remove(book.id);
                toast.success("Dihapus dari favorit");
            } else {
                await favoritesApi.add(book.id);
                toast.success("Ditambahkan ke favorit");
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            toast.error("Gagal mengubah favorit");
        }
    };

    const handleBagikan = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link buku disalin ke clipboard!");
    };

    if (authLoading || isLoading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Memuat detail buku...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!book) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>Buku tidak ditemukan</p>
                <Link href="/siswa/katalog" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Kembali ke Katalog</Link>
            </div>
        );
    }

    const hasCover = book.coverUrl && (book.coverUrl.startsWith('http') || book.coverUrl.startsWith('/') || book.coverUrl.startsWith('data:'));
    const coverStyle = hasCover
        ? { backgroundImage: `url(${book.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: coverGradients[book.title.length % coverGradients.length] };

    const getLoanButtonLabel = () => {
        if (isSubmitting) return "Memproses...";
        if (hasActiveLoan) {
            if (loanStatus === 'PENDING') return 'Menunggu Persetujuan';
            if (loanStatus === 'APPROVED') return 'Disetujui - Ambil Buku';
            return 'Sedang Dipinjam';
        }
        if (book.availableStock <= 0) return "Stok Habis";
        return "Pinjam Buku Ini";
    };

    const getLoanButtonColor = () => {
        if (hasActiveLoan) {
            if (loanStatus === 'PENDING') return '#f59e0b';
            if (loanStatus === 'APPROVED') return '#22c55e';
            return '#6b7280';
        }
        return '#3b82f6';
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Back Button */}
            <Link href="/siswa/katalog" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                padding: '8px 16px', background: 'white', borderRadius: '10px',
                border: '1px solid #e5e7eb', marginBottom: '2rem',
                transition: 'all 0.2s',
            }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Kembali ke Katalog
            </Link>

            {/* ===== HERO SECTION ===== */}
            <div style={{
                display: 'flex', gap: '3rem', background: 'white', borderRadius: '20px',
                padding: '2.5rem', border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)',
            }}>
                {/* Cover */}
                <div style={{ flexShrink: 0 }}>
                    <div style={{
                        width: '220px', height: '320px', borderRadius: '14px',
                        ...coverStyle,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {!hasCover && (
                            <>
                                <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', padding: '0 20px', lineHeight: 1.2 }}>
                                    {book.title.split(' ').slice(0, 2).join(' ')}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500, marginTop: '10px', letterSpacing: '1px' }}>
                                    {book.author}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                            background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe',
                        }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            {book.category?.name || "Umum"}
                        </span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                            background: '#fefce8', color: '#b45309', border: '1px solid #fef08a',
                        }}>
                            <svg viewBox="0 0 24 24" fill="#f59e0b" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            {ratingStats.totalReviews > 0 ? `${ratingStats.averageRating.toFixed(1)} (${ratingStats.totalReviews})` : "Belum ada ulasan"}
                        </span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                            background: book.availableStock > 0 ? '#f0fdf4' : '#fef2f2',
                            color: book.availableStock > 0 ? '#16a34a' : '#dc2626',
                            border: `1px solid ${book.availableStock > 0 ? '#bbf7d0' : '#fecaca'}`,
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                {book.availableStock > 0 ? <><circle cx="12" cy="12" r="10" /><polyline points="9 12 12 15 16 10" /></> : <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>}
                            </svg>
                            {book.availableStock > 0 ? `${book.availableStock} Tersedia` : 'Stok Habis'}
                        </span>
                    </div>

                    {/* Title & Author */}
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 6px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>{book.title}</h1>
                    <p style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 24px', fontWeight: 500 }}>oleh <span style={{ color: '#374151', fontWeight: 600 }}>{book.author}</span></p>

                    {/* Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
                        {[
                            { label: 'Penerbit', value: book.publisher },
                            { label: 'Tahun Terbit', value: book.year },
                            { label: 'ISBN', value: book.isbn },
                        ].map(item => (
                            <div key={item.label} style={{
                                padding: '14px 16px', background: '#f8fafc', borderRadius: '12px',
                                border: '1px solid #f1f5f9',
                            }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value || '-'}</div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={handlePinjam}
                            disabled={isSubmitting || book.availableStock <= 0 || hasActiveLoan}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                padding: '12px 28px', borderRadius: '12px', border: 'none',
                                background: getLoanButtonColor(),
                                color: 'white', fontSize: '14px', fontWeight: 700,
                                cursor: (isSubmitting || book.availableStock <= 0 || hasActiveLoan) ? 'not-allowed' : 'pointer',
                                opacity: (isSubmitting || book.availableStock <= 0 || hasActiveLoan) ? 0.7 : 1,
                                transition: 'all 0.2s',
                                boxShadow: `0 4px 14px ${getLoanButtonColor()}40`,
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            {getLoanButtonLabel()}
                        </button>

                        <button
                            onClick={handleToggleFavorite}
                            title={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
                            style={{
                                width: '48px', height: '48px', borderRadius: '12px', border: '1px solid',
                                borderColor: isFavorite ? '#fecaca' : '#e5e7eb',
                                background: isFavorite ? '#fef2f2' : 'white',
                                color: isFavorite ? '#ef4444' : '#9ca3af',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" width="20" height="20">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>

                        <button
                            onClick={handleBagikan}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '12px 20px', borderRadius: '12px',
                                border: '1px solid #e5e7eb', background: 'white',
                                color: '#374151', fontSize: '14px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            Bagikan
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== SYNOPSIS ===== */}
            <div style={{
                marginTop: '2rem', background: 'white', borderRadius: '16px',
                padding: '2rem', border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" width="16" height="16">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Sinopsis</h2>
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#4b5563', margin: 0 }}>
                    {book.synopsis || "Sinopsis belum tersedia untuk buku ini."}
                </p>
            </div>

            {/* ===== REVIEWS ===== */}
            {book && <ReviewsSection bookId={book.id} />}

            {/* ===== SIMILAR BOOKS ===== */}
            {similarBooks.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Buku Serupa</h2>
                        <Link href="/siswa/katalog" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                        }}>
                            Lihat Semua
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {similarBooks.map((sb, idx) => {
                            const sbHasCover = sb.coverUrl && (sb.coverUrl.startsWith('http') || sb.coverUrl.startsWith('/') || sb.coverUrl.startsWith('data:'));
                            const sbCoverStyle = sbHasCover
                                ? { backgroundImage: `url(${sb.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                : { background: coverGradients[idx % coverGradients.length] };
                            return (
                                <Link key={sb.id} href={`/siswa/detail?id=${sb.id}`} style={{
                                    textDecoration: 'none', background: 'white', borderRadius: '14px',
                                    border: '1px solid #e5e7eb', overflow: 'hidden',
                                    transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}>
                                    <div style={{ height: '180px', ...sbCoverStyle }} />
                                    <div style={{ padding: '14px 16px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sb.title}</h3>
                                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{sb.author}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== LOAN MODAL ===== */}
            {isLoanPopupOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)',
                }} onClick={() => setIsLoanPopupOpen(false)}>
                    <div style={{
                        background: 'white', borderRadius: '20px', maxWidth: '480px', width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
                        animation: 'fadeIn 0.2s ease-out',
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
                        }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Konfirmasi Peminjaman</h2>
                            <button onClick={() => setIsLoanPopupOpen(false)} style={{
                                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                background: '#f3f4f6', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', color: '#6b7280',
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Book Preview */}
                            <div style={{
                                display: 'flex', gap: '16px', padding: '16px',
                                background: '#f8fafc', borderRadius: '12px', marginBottom: '20px',
                                border: '1px solid #f1f5f9',
                            }}>
                                <div style={{
                                    width: '56px', height: '76px', borderRadius: '8px', flexShrink: 0,
                                    ...coverStyle,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }} />
                                <div style={{ minWidth: 0 }}>
                                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>{book.title}</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{book.author}</p>
                                </div>
                            </div>

                            {/* Duration */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                                    Durasi Peminjaman
                                </label>
                                <select
                                    value={loanDuration}
                                    onChange={(e) => setLoanDuration(Number(e.target.value))}
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        border: '1px solid #e5e7eb', borderRadius: '10px',
                                        fontSize: '14px', background: 'white', color: '#1f2937',
                                        fontFamily: 'inherit', outline: 'none',
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                        <option key={day} value={day}>{day} hari</option>
                                    ))}
                                </select>
                                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9ca3af' }}>Maksimal peminjaman adalah 7 hari</p>
                            </div>

                            {/* Terms */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                                        style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#3b82f6', flexShrink: 0 }} />
                                    <span style={{ fontSize: '13px', lineHeight: 1.6, color: '#4b5563' }}>
                                        Saya menyetujui{" "}
                                        <a href="/siswa/peraturan" target="_blank" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                                            syarat & ketentuan peminjaman
                                        </a>
                                        {" "}dan bertanggung jawab atas buku yang dipinjam.
                                    </span>
                                </label>
                            </div>

                            {/* Warning */}
                            <div style={{
                                padding: '12px 16px', background: '#fefce8', borderRadius: '10px',
                                border: '1px solid #fef08a',
                            }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    Keterlambatan pengembalian akan dikenakan denda.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            display: 'flex', gap: '10px', justifyContent: 'flex-end',
                            padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc',
                        }}>
                            <button onClick={() => setIsLoanPopupOpen(false)} style={{
                                padding: '10px 20px', background: 'white', border: '1px solid #e5e7eb',
                                borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#374151',
                            }}>
                                Batal
                            </button>
                            <button onClick={confirmPinjam} disabled={!termsAccepted || isSubmitting} style={{
                                padding: '10px 24px',
                                background: termsAccepted ? '#3b82f6' : '#d1d5db',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontSize: '14px', fontWeight: 700,
                                cursor: termsAccepted && !isSubmitting ? 'pointer' : 'not-allowed',
                                opacity: isSubmitting ? 0.7 : 1,
                                boxShadow: termsAccepted ? '0 4px 14px rgba(59,130,246,0.3)' : 'none',
                            }}>
                                {isSubmitting ? "Memproses..." : "Konfirmasi Pinjam"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
}

export default function DetailBukuPage() {
    return (
        <Suspense fallback={
            <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat...</div>
        }>
            <DetailBukuContent />
        </Suspense>
    );
}
