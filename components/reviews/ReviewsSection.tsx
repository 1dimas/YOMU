import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { reviewsApi } from '@/lib/api';
import type { Review, ReviewStats } from '@/types';
import StarRating from './StarRating';

interface ReviewsSectionProps {
    bookId: string;
}

export default function ReviewsSection({ bookId }: ReviewsSectionProps) {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const loadReviews = async () => {
        try {
            const { data } = await reviewsApi.getByBookId(bookId);
            setReviews(data.reviews);
            setStats(data.stats);
        } catch (err: unknown) {
            console.error(err);
            setError("Gagal memuat ulasan.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [bookId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (rating === 0) {
            setSubmitError("Silakan berikan rating bintang.");
            return;
        }
        if (!comment.trim()) {
            setSubmitError("Silakan tulis komentar Anda.");
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewsApi.create({ bookId, rating, comment });
            setRating(0);
            setComment("");
            loadReviews(); // Reload to show new review
        } catch (err: any) {
            setSubmitError(err.message || "Gagal mengirim ulasan. Pastikan Anda sudah meminjam & mengembalikan buku ini.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const userHasReviewed = user ? reviews.some(r => r.userId === user.id) : false;

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { star, count, percentage };
    });

    if (isLoading) return (
        <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'white',
            borderRadius: '1rem',
            marginTop: '2rem'
        }}>
            <p style={{ color: '#94a3b8' }}>Memuat ulasan...</p>
        </div>
    );

    return (
        <div style={{
            marginTop: '3rem',
            background: 'white',
            borderRadius: '1.25rem',
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            {/* Header */}
            <div style={{
                padding: '2rem',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', color: '#f59e0b' }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Ulasan Pembaca
                </h2>
            </div>

            {/* Rating Summary Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: stats.totalReviews > 0 ? '300px 1fr' : '1fr',
                gap: '3rem',
                padding: '2.5rem',
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                borderBottom: '1px solid #fde68a'
            }}>
                {/* Overall Rating */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        fontSize: '4.5rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                        marginBottom: '1rem'
                    }}>
                        {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "0.0"}
                    </div>
                    <StarRating rating={stats.averageRating || 0} size={28} />
                    <p style={{
                        marginTop: '1rem',
                        fontSize: '0.95rem',
                        color: '#64748b',
                        fontWeight: 600
                    }}>
                        Berdasarkan {stats.totalReviews} ulasan
                    </p>
                </div>

                {/* Rating Distribution */}
                {stats.totalReviews > 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '0.75rem'
                    }}>
                        {ratingDistribution.map(({ star, count, percentage }) => (
                            <div key={star} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    minWidth: '80px',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#475569'
                                }}>
                                    <span>{star}</span>
                                    <svg viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </div>
                                <div style={{
                                    flex: 1,
                                    height: '10px',
                                    background: 'white',
                                    borderRadius: '999px',
                                    overflow: 'hidden',
                                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${percentage}%`,
                                        background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                                        borderRadius: '999px',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                                <span style={{
                                    minWidth: '50px',
                                    fontSize: '0.875rem',
                                    color: '#64748b',
                                    fontWeight: 600,
                                    textAlign: 'right'
                                }}>
                                    {count} {count === 1 ? 'ulasan' : 'ulasan'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Form */}
            <div style={{ padding: '2rem' }}>
                {isAuthenticated && !userHasReviewed ? (
                    <div style={{
                        marginBottom: '2rem',
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '1rem',
                        border: '2px dashed #cbd5e1'
                    }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '1.5rem'
                        }}>
                            ✍️ Tulis Ulasan Anda
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                    marginBottom: '0.75rem'
                                }}>
                                    Rating Anda
                                </label>
                                <div style={{
                                    padding: '1rem',
                                    background: 'white',
                                    borderRadius: '0.75rem',
                                    display: 'inline-flex',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <StarRating rating={rating} setRating={setRating} editable size={36} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                    marginBottom: '0.75rem'
                                }}>
                                    Komentar
                                </label>
                                <textarea
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        minHeight: '120px',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                    placeholder="Ceritakan pengalaman Anda membaca buku ini..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                    }}
                                />
                            </div>
                            {submitError && (
                                <div style={{
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '0.75rem',
                                    color: '#dc2626',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {submitError}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting || rating === 0 || !comment.trim()}
                                style={{
                                    padding: '0.875rem 2rem',
                                    background: (isSubmitting || rating === 0 || !comment.trim()) ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: (isSubmitting || rating === 0 || !comment.trim()) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: (isSubmitting || rating === 0 || !comment.trim()) ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSubmitting && rating > 0 && comment.trim()) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = (isSubmitting || rating === 0 || !comment.trim()) ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Kirim Ulasan
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : isAuthenticated && userHasReviewed ? (
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.25rem 1.5rem',
                        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                        borderRadius: '1rem',
                        border: '1px solid #6ee7b7',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: '28px', height: '28px' }}>
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p style={{
                                margin: 0,
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                color: '#065f46'
                            }}>
                                Terima kasih atas ulasan Anda!
                            </p>
                            <p style={{
                                margin: '0.25rem 0 0 0',
                                fontSize: '0.875rem',
                                color: '#047857'
                            }}>
                                Ulasan Anda membantu pembaca lain dalam memilih buku.
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* List Reviews */}
                {reviews.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '1rem',
                        border: '2px dashed #cbd5e1'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            borderRadius: '50%',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" style={{ width: '40px', height: '40px' }}>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </div>
                        <p style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#475569',
                            marginBottom: '0.5rem'
                        }}>
                            Belum ada ulasan
                        </p>
                        <p style={{
                            fontSize: '0.95rem',
                            color: '#64748b'
                        }}>
                            Jadilah yang pertama memberikan ulasan untuk buku ini!
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '0.5rem'
                        }}>
                            📝 Semua Ulasan ({reviews.length})
                        </h3>
                        {reviews.map((review, index) => (
                            <div key={review.id} style={{
                                padding: '1.5rem',
                                background: 'white',
                                borderRadius: '1rem',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            flexShrink: 0,
                                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                                        }}>
                                            {review.user?.avatarUrl ? (
                                                <img src={review.user.avatarUrl} alt={review.user.name} style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover'
                                                }} />
                                            ) : (
                                                (review.user?.name?.charAt(0) || 'U').toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h4 style={{
                                                margin: 0,
                                                fontSize: '1.05rem',
                                                fontWeight: 700,
                                                color: '#1e293b'
                                            }}>
                                                {review.user?.name || "Pengguna"}
                                            </h4>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                marginTop: '0.35rem'
                                            }}>
                                                <StarRating rating={review.rating} size={16} />
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: '#94a3b8',
                                                    fontWeight: 600
                                                }}>
                                                    {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.95rem',
                                    color: '#475569',
                                    lineHeight: 1.7,
                                    paddingLeft: '4rem'
                                }}>
                                    {review.comment}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
