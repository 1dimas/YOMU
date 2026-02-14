"use client";

import BookCard from "@/components/BookCard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { favoritesApi } from "@/lib/api";
import type { Favorite } from "@/types";

// Cover gradients for books without covers
const coverGradients = [
    "linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)",
    "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)",
    "linear-gradient(135deg, #68d391 0%, #48bb78 100%)",
    "linear-gradient(135deg, #90cdf4 0%, #63b3ed 100%)",
    "linear-gradient(135deg, #fc8181 0%, #f56565 100%)",
    "linear-gradient(135deg, #b794f4 0%, #9f7aea 100%)",
];

export default function FavoritPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState("terbaru");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        const fetchFavorites = async () => {
            try {
                const response = await favoritesApi.getAll();
                setFavorites(response.data || []);
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated, authLoading, router]);

    // Sort favorites
    const sortedFavorites = [...favorites].sort((a, b) => {
        if (sortBy === "judul") {
            return (a.book?.title || "").localeCompare(b.book?.title || "");
        }
        // Default: terbaru (by createdAt desc)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (authLoading || isLoading) {
        return (
            <div className="dashboard-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <p>Memuat...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            {/* Page Header */}
            <div className="favorit-header">
                <h1 className="page-title">
                    Koleksi Favorit Saya{" "}
                    <span className="heart-icon">❤️</span>
                </h1>
                <div className="sort-control">
                    <span>Tampilkan:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="terbaru">Terbaru Ditambahkan</option>
                        <option value="judul">Judul A-Z</option>
                    </select>
                </div>
            </div>

            {/* Book Grid */}
            <div className="book-grid">
                {sortedFavorites.map((fav, index) => (
                    <BookCard
                        key={fav.id}
                        id={fav.book?.id || fav.bookId}
                        title={fav.book?.title || "Buku"}
                        author={(fav.book?.author || "").toUpperCase()}
                        rating={fav.book?.averageRating || 0}
                        totalReviews={fav.book?.totalReviews || 0}
                        description={fav.book?.synopsis?.slice(0, 80) + "..." || ""}
                        coverColor={fav.book?.coverUrl || coverGradients[index % coverGradients.length]}
                        isFavorite={true}
                    />
                ))}
            </div>

            {sortedFavorites.length === 0 && (
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <p>Belum ada buku favorit</p>
                    <Link href="/siswa/katalog" className="btn-pinjam" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem' }}>
                        Jelajahi Katalog
                    </Link>
                </div>
            )}
        </div>
    );
}
