"use client";

import { useEffect, useState } from "react";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { booksApi, statsApi, categoriesApi, loansApi, favoritesApi } from "@/lib/api";

import type { Book, Category, SiswaStats } from "@/types";

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
    "Fiksi": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    "Non-Fiksi": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    "Akademik": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    ),
};

// Cover color gradients for books without covers
const coverGradients = [
    "linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)",
    "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)",
    "linear-gradient(135deg, #68d391 0%, #48bb78 100%)",
    "linear-gradient(135deg, #90cdf4 0%, #63b3ed 100%)",
    "linear-gradient(135deg, #fc8181 0%, #f56565 100%)",
    "linear-gradient(135deg, #b794f4 0%, #9f7aea 100%)",
];

export default function SiswaDashboard() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
    const [loanMap, setLoanMap] = useState<Map<string, string>>(new Map());
    const [stats, setStats] = useState<SiswaStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        // Redirect if not authenticated
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [booksRes, categoriesRes, statsRes, favoritesRes, loansRes] = await Promise.all([
                    booksApi.getAll({ limit: 10 }).catch(() => ({ data: [] })),
                    categoriesApi.getAll().catch(() => ({ data: [] })),
                    statsApi.getSiswa().catch(() => ({ data: { borrowedBooks: 0, favoriteCount: 0, unreadMessages: 0 } })),
                    favoritesApi.getAll().catch(() => ({ data: [] })),
                    loansApi.getMy({}).catch(() => ({ data: [] })),
                ]);

                setBooks(booksRes.data || []);
                setCategories(categoriesRes.data || []);
                setStats(statsRes.data);

                const favIds = new Set((favoritesRes.data || []).map((fav: any) => fav.bookId));
                setFavoriteBookIds(favIds);

                // Create map of bookId -> loanStatus for active loans
                const loans = loansRes.data || [];
                const activeLoanMap = new Map<string, string>();
                loans.forEach((loan: any) => {
                    if (['PENDING', 'APPROVED', 'BORROWED', 'OVERDUE'].includes(loan.status)) {
                        activeLoanMap.set(loan.bookId, loan.status);
                    }
                });
                setLoanMap(activeLoanMap);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, authLoading, router]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Tidak ada";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };

    if (authLoading || isLoading) {
        return (
            <div className="dashboard-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <p>Memuat...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            {/* Greeting */}
            <div className="greeting">
                <h1>Halo, {user?.name || "Siswa"}!</h1>
                <p>Mau baca apa hari ini?</p>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stats-section">
                    <div className="stats-cards">
                        {/* Buku Sedang Dipinjam */}
                        <div className="stat-card">
                            <div className="stat-icon primary">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>{stats?.borrowedBooks || 0}</h3>
                                <p>Buku Sedang Dipinjam</p>
                            </div>
                        </div>

                        {/* Tenggat Kembali */}
                        <div className="stat-card">
                            <div className="stat-icon warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>{formatDate(stats?.nearestDueDate)}</h3>
                                <p>Tenggat Kembali Terdekat</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kategori Populer */}
                <div className="kategori-section">
                    <div className="kategori-title">Kategori Populer</div>
                    <div className="kategori-list">
                        {categories.length > 0 ? categories.slice(0, 3).map((cat) => (
                            <Link key={cat.id} href={`/siswa/katalog?category=${cat.id}`} className="kategori-item">
                                <div className={`kategori-icon`} style={{ backgroundColor: cat.color }}>
                                    {categoryIcons[cat.name] || categoryIcons["Fiksi"]}
                                </div>
                                <span>{cat.name}</span>
                            </Link>
                        )) : (
                            <>
                                <div className="kategori-item">
                                    <div className="kategori-icon fiksi">{categoryIcons["Fiksi"]}</div>
                                    <span>Fiksi</span>
                                </div>
                                <div className="kategori-item">
                                    <div className="kategori-icon non-fiksi">{categoryIcons["Non-Fiksi"]}</div>
                                    <span>Non-Fiksi</span>
                                </div>
                                <div className="kategori-item">
                                    <div className="kategori-icon akademik">{categoryIcons["Akademik"]}</div>
                                    <span>Akademik</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Book Recommendations */}
            <section className="book-section">
                <div className="section-header">
                    <h2 className="section-title">Rekomendasi Buku Untukmu</h2>
                    <Link href="/siswa/katalog" className="section-link">
                        Lihat Semua →
                    </Link>
                </div>

                <div className="book-grid">
                    {books.length > 0 ? books.map((book, index) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            author={book.author.toUpperCase()}
                            rating={book.averageRating || 0}
                            totalReviews={book.totalReviews || 0}
                            description={book.synopsis?.slice(0, 80) + "..." || ""}
                            coverColor={book.coverUrl || coverGradients[index % coverGradients.length]}
                            isFavorite={favoriteBookIds.has(book.id)}
                            loanStatus={loanMap.get(book.id) as 'PENDING' | 'APPROVED' | 'BORROWED' | 'OVERDUE' | undefined}
                        />

                    )) : (
                        <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666" }}>
                            Tidak ada rekomendasi buku saat ini.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
