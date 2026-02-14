"use client";

import BookCard from "@/components/BookCard";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { booksApi, categoriesApi } from "@/lib/api";
import type { Book, Category } from "@/types";

// Cover gradients for books without covers
const coverGradients = [
    "linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)",
    "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)",
    "linear-gradient(135deg, #68d391 0%, #48bb78 100%)",
    "linear-gradient(135deg, #90cdf4 0%, #63b3ed 100%)",
    "linear-gradient(135deg, #fc8181 0%, #f56565 100%)",
    "linear-gradient(135deg, #b794f4 0%, #9f7aea 100%)",
];

function KatalogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("semua");

    // Get initial category from URL
    useEffect(() => {
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [searchParams]);

    // Auth check and fetch data
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [booksRes, categoriesRes] = await Promise.all([
                    booksApi.getAll({
                        search: searchQuery || undefined,
                        categoryId: selectedCategory !== "semua" ? selectedCategory : undefined
                    }),
                    categoriesApi.getAll(),
                ]);
                setBooks(booksRes.data || []);
                setCategories(categoriesRes.data || []);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, authLoading, router, searchQuery, selectedCategory]);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Refetch when search changes
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchBooks = async () => {
            setIsLoading(true);
            try {
                const booksRes = await booksApi.getAll({
                    search: debouncedSearch || undefined,
                    categoryId: selectedCategory !== "semua" ? selectedCategory : undefined,
                });
                setBooks(booksRes.data || []);
            } catch (error) {
                console.error("Failed to fetch books:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBooks();
    }, [debouncedSearch, selectedCategory, isAuthenticated]);

    if (authLoading) {
        return (
            <div className="dashboard-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <p>Memuat...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Katalog Buku</h1>
                <p className="page-subtitle">Temukan buku favoritmu dari koleksi perpustakaan kami</p>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-filter">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Cari judul atau penulis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="kategori-filter">
                    <button
                        className={`filter-btn ${selectedCategory === "semua" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("semua")}
                    >
                        Semua Kategori
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`filter-btn ${selectedCategory === cat.id ? "active" : ""}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Count */}
            <div className="results-info">
                {isLoading ? "Mencari..." : (
                    <>
                        Menampilkan <strong>{books.length}</strong> buku
                        {selectedCategory !== "semua" && categories.find(c => c.id === selectedCategory) &&
                            ` dalam kategori ${categories.find(c => c.id === selectedCategory)?.name}`
                        }
                        {searchQuery && ` untuk "${searchQuery}"`}
                    </>
                )}
            </div>

            {/* Book Grid */}
            {isLoading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>Memuat buku...</div>
            ) : (
                <div className="book-grid">
                    {books.map((book, index) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            author={book.author.toUpperCase()}
                            rating={book.averageRating || 0}
                            totalReviews={book.totalReviews || 0}
                            description={book.synopsis?.slice(0, 80) + "..." || ""}
                            coverColor={book.coverUrl || coverGradients[index % coverGradients.length]}
                            isFavorite={false}
                        />
                    ))}
                </div>
            )}

            {!isLoading && books.length === 0 && (
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p>Tidak ada buku yang ditemukan</p>
                </div>
            )}
        </div>
    );
}

export default function KatalogPage() {
    return (
        <Suspense fallback={
            <div className="katalog-page">
                <p style={{ padding: '2rem', textAlign: 'center' }}>Memuat katalog...</p>
            </div>
        }>
            <KatalogContent />
        </Suspense>
    );
}
