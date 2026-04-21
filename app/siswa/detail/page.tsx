"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { booksApi, favoritesApi, loansApi, reviewsApi } from "@/lib/api";
import type { Book } from "@/types";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { toast } from "sonner";
import SiswaSkeleton from "@/components/SiswaSkeleton";

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
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [loanDuration, setLoanDuration] = useState(7);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [libraryRules, setLibraryRules] = useState<string>("");

    useEffect(() => {
        const DEFAULT_RULES = `## Peraturan Peminjaman Buku Perpustakaan

### 1. Ketentuan Umum
- Setiap anggota perpustakaan berhak meminjam buku dengan kartu anggota yang masih berlaku.
- Maksimal peminjaman adalah **3 buku** sekaligus.
- Durasi peminjaman adalah **3 hingga 7 hari** kalender.

### 2. Prosedur Peminjaman
- Pilih buku yang ingin dipinjam melalui katalog.
- Klik tombol "Pinjam Buku" dan pilih durasi peminjaman.
- Tunggu persetujuan dari petugas perpustakaan.
- Setelah disetujui, ambil buku di meja layanan perpustakaan.

### 3. Pengembalian Buku
- Buku wajib dikembalikan sebelum atau pada tanggal jatuh tempo.
- Pengembalian dilakukan di meja layanan perpustakaan.
- Pastikan kondisi buku baik saat dikembalikan.

### 4. Keterlambatan & Denda
- Keterlambatan pengembalian dikenakan denda **Rp 1.000 per hari** per buku.
- Buku yang rusak atau hilang wajib diganti sesuai harga buku.

### 5. Larangan
- Dilarang memindahtangankan buku pinjaman kepada orang lain.
- Dilarang mencoret, melipat, atau merusak buku.
- Dilarang membawa makanan/minuman saat membaca di perpustakaan.

---

*Dengan meminjam buku, Anda menyetujui semua peraturan di atas.*`;

        if (typeof window !== "undefined") {
            const savedRules = localStorage.getItem("library_rules");
            setLibraryRules(savedRules || DEFAULT_RULES);
        }
    }, []);

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
        return <SiswaSkeleton variant="detail" />;
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
        return '#22c55e';
    };

    const renderStars = (rating: number, size = 16) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} viewBox="0 0 24 24" width={size} height={size}
                        fill={i <= Math.round(rating) ? '#fbbf24' : '#e5e7eb'}
                        stroke={i <= Math.round(rating) ? '#fbbf24' : '#e5e7eb'}
                        strokeWidth="1"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

            {/* ===== BREADCRUMB ===== */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '1.5rem' }}>
                <Link href="/siswa/katalog" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >Collection</Link>
                <span style={{ color: '#d1d5db' }}>›</span>
                <span style={{ color: '#9ca3af' }}>{book.category?.name || 'Umum'}</span>
                <span style={{ color: '#d1d5db' }}>›</span>
                <span style={{ color: '#374151', fontWeight: 600 }}>{book.title}</span>
            </div>

            {/* ===== HERO SECTION ===== */}
            <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2rem' }}>
                {/* Cover */}
                <div style={{ flexShrink: 0 }}>
                    <div style={{
                        width: '200px', height: '280px', borderRadius: '16px',
                        ...coverStyle,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {!hasCover && (
                            <>
                                <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', padding: '0 20px', lineHeight: 1.2 }}>
                                    {book.title.split(' ').slice(0, 2).join(' ')}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 500, marginTop: '8px', letterSpacing: '1px' }}>
                                    {book.author}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: '0.25rem' }}>
                    {/* Badges row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                            background: book.availableStock > 0 ? '#dcfce7' : '#fee2e2',
                            color: book.availableStock > 0 ? '#15803d' : '#dc2626',
                        }}>
                            {book.availableStock > 0 ? `${book.availableStock} Tersedia` : 'Stok Habis'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg viewBox="0 0 24 24" fill="#fbbf24" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                                {ratingStats.totalReviews > 0 ? ratingStats.averageRating.toFixed(1) : '0.0'}
                            </span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'Review' : 'Reviews'})
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                        {book.title}
                    </h1>

                    {/* Author */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700, color: '#6b7280',
                        }}>
                            {book.author.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '15px', color: '#374151', fontWeight: 500 }}>{book.author}</span>
                    </div>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', marginBottom: '28px' }}>
                        {[
                            { label: 'PUBLISHER', value: book.publisher || '-' },
                            { label: 'YEAR', value: String(book.year) },
                            { label: 'ISBN', value: book.isbn || '-' },
                            { label: 'CATEGORY', value: book.category?.name || 'Umum' },
                        ].map((item, idx) => (
                            <div key={item.label} style={{
                                borderLeft: idx > 0 ? '1px solid #e5e7eb' : 'none',
                                paddingLeft: idx > 0 ? '20px' : '0',
                                paddingRight: '12px',
                            }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{item.label}</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={handlePinjam}
                            disabled={isSubmitting || book.availableStock <= 0 || hasActiveLoan}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                padding: '13px 28px', borderRadius: '12px', border: 'none',
                                background: getLoanButtonColor(),
                                color: 'white', fontSize: '14px', fontWeight: 700,
                                cursor: (isSubmitting || book.availableStock <= 0 || hasActiveLoan) ? 'not-allowed' : 'pointer',
                                opacity: (isSubmitting || book.availableStock <= 0 || hasActiveLoan) ? 0.65 : 1,
                                transition: 'all 0.2s',
                                boxShadow: `0 4px 14px ${getLoanButtonColor()}30`,
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
                            title="Bagikan"
                            style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                border: '1px solid #e5e7eb', background: 'white',
                                color: '#9ca3af', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== SYNOPSIS + REVIEW WIDGET ===== */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem',
                marginBottom: '2.5rem',
            }}>
                {/* Synopsis Card */}
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '2rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: '#3b82f6' }} />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>Synopsis</h2>
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#4b5563', margin: '0 0 24px' }}>
                        {book.synopsis || "Sinopsis belum tersedia untuk buku ini."}
                    </p>


                </div>

                {/* Review Widget Card */}
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '2rem 1.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', textAlign: 'center',
                }}>
                    {ratingStats.totalReviews > 0 ? (
                        <>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', lineHeight: 1, marginBottom: '8px' }}>
                                {ratingStats.averageRating.toFixed(1)}
                            </div>
                            {renderStars(ratingStats.averageRating, 20)}
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '12px 0 0', fontWeight: 500 }}>
                                Based on {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'}
                            </p>
                        </>
                    ) : (
                        <>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '14px',
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" width="28" height="28">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </div>
                            {renderStars(0, 18)}
                            <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '14px 0 4px' }}>No reviews yet</p>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px', lineHeight: 1.5 }}>
                                Be the first one to share your thoughts on this masterpiece.
                            </p>
                            <a href="#reviews-section" style={{
                                color: '#22c55e', textDecoration: 'none', fontSize: '13px', fontWeight: 700,
                                cursor: 'pointer', transition: 'color 0.2s',
                            }}>
                                Write a review
                            </a>
                        </>
                    )}
                </div>
            </div>

            {/* ===== REVIEWS SECTION ===== */}
            <div id="reviews-section">
                {book && <ReviewsSection bookId={book.id} />}
            </div>

            {/* ===== SIMILAR BOOKS ===== */}
            {similarBooks.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Similar Books</h2>
                            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontWeight: 500 }}>Recommended based on your preferences</p>
                        </div>
                        <Link href="/siswa/katalog" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            color: '#22c55e', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                            marginTop: '4px',
                        }}>
                            View All
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                        {similarBooks.map((sb, idx) => {
                            const sbHasCover = sb.coverUrl && (sb.coverUrl.startsWith('http') || sb.coverUrl.startsWith('/') || sb.coverUrl.startsWith('data:'));
                            const sbCoverStyle = sbHasCover
                                ? { backgroundImage: `url(${sb.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                : { background: coverGradients[idx % coverGradients.length] };
                            return (
                                <Link key={sb.id} href={`/siswa/detail?id=${sb.id}`} style={{
                                    textDecoration: 'none', background: 'white', borderRadius: '14px',
                                    border: '1px solid #e5e7eb', overflow: 'hidden',
                                    transition: 'all 0.25s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                                >
                                    <div style={{
                                        height: '200px', ...sbCoverStyle,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {!sbHasCover && (
                                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', padding: '0 16px' }}>
                                                {sb.title.split(' ').slice(0, 3).join(' ')}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {sb.category?.name || 'Umum'}
                                            </span>
                                            <span style={{ fontSize: '10px', color: '#d1d5db' }}>•</span>
                                            <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>{sb.year}</span>
                                        </div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sb.title}</h3>
                                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, fontWeight: 500 }}>{sb.author}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== FOOTER ===== */}
            <div style={{
                marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9',
                textAlign: 'center',
            }}>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontWeight: 500 }}>
                    © 2024 YOMU Digital Sanctuary. All rights reserved.
                </p>
            </div>

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
                                    {[3, 4, 5, 6, 7].map((day) => (
                                        <option key={day} value={day}>{day} hari</option>
                                    ))}
                                </select>
                                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9ca3af' }}>Minimal peminjaman 3 hari, maksimal 7 hari</p>
                            </div>

                            {/* Terms */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                                        style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#3b82f6', flexShrink: 0 }} />
                                    <span style={{ fontSize: '13px', lineHeight: 1.6, color: '#4b5563' }}>
                                        Saya menyetujui{" "}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); setIsRulesOpen(true); }}
                                            style={{ color: '#3b82f6', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 'inherit', padding: 0 }}
                                        >
                                            syarat & ketentuan peminjaman
                                        </button>
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

            {/* ===== RULES POPUP ===== */}
            {isRulesOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1100, backdropFilter: 'blur(4px)',
                }} onClick={() => setIsRulesOpen(false)}>
                    <div style={{
                        background: 'white', borderRadius: '20px', maxWidth: '560px', width: '90%',
                        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
                        animation: 'fadeIn 0.2s ease-out',
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Peraturan Peminjaman</h2>
                            </div>
                            <button onClick={() => setIsRulesOpen(false)} style={{
                                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                background: '#f3f4f6', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', color: '#6b7280',
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div
                                style={{ lineHeight: 1.8, fontSize: "0.9rem", color: "#334155" }}
                                dangerouslySetInnerHTML={{
                                    __html: libraryRules
                                        .replace(/## (.*)/g, '<h2 style="font-size:1.25rem;font-weight:700;margin:1.5rem 0 0.75rem;color:#1e293b">$1</h2>')
                                        .replace(/### (.*)/g, '<h3 style="font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;color:#334155">$1</h3>')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/- (.*)/g, '<li style="margin-left:1.5rem;margin-bottom:0.25rem">$1</li>')
                                        .replace(/\n\n/g, '<br/>')
                                        .replace(/---/g, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0"/>')
                                        .replace(/\*(.*?)\*/g, '<em style="color:#64748b">$1</em>'),
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px', borderTop: '1px solid #f1f5f9',
                            display: 'flex', justifyContent: 'flex-end', flexShrink: 0,
                        }}>
                            <button onClick={() => setIsRulesOpen(false)} style={{
                                padding: '10px 24px', background: '#3b82f6', color: 'white',
                                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                                cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                            }}>
                                Saya Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DetailBukuPage() {
    return (
        <Suspense fallback={<SiswaSkeleton variant="detail" />}>
            <DetailBukuContent />
        </Suspense>
    );
}
