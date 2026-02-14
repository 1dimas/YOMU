"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { favoritesApi } from "@/lib/api";

interface BookCardProps {
    id: string | number;
    title: string;
    author: string;
    rating?: number;
    totalReviews?: number;
    description: string;
    coverColor?: string;
    isFavorite?: boolean;
    loanStatus?: 'PENDING' | 'APPROVED' | 'BORROWED' | 'OVERDUE' | null;
}

export default function BookCard({
    id,
    title,
    author,
    rating = 0,
    totalReviews = 0,
    description,
    coverColor = "linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)",
    isFavorite = false,
    loanStatus = null,
}: BookCardProps) {
    const router = useRouter();
    const [favorite, setFavorite] = useState(isFavorite);

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            const isFilled = i < fullStars;
            stars.push(
                <svg
                    key={i}
                    viewBox="0 0 24 24"
                    fill={isFilled ? "#fbbf24" : "none"}
                    stroke={isFilled ? "#fbbf24" : "#cbd5e1"}
                    strokeWidth="2"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }
        return stars;
    };

    const handleCardClick = () => {
        router.push(`/siswa/detail?id=${id}`);
    };

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (favorite) {
                await favoritesApi.remove(String(id));
            } else {
                await favoritesApi.add(String(id));
            }
            setFavorite(!favorite);
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    // Determine if coverColor is a URL, Base64 string, or a gradient
    const isImage = coverColor.startsWith('http') || coverColor.startsWith('/') || coverColor.startsWith('data:');

    const coverStyle = isImage
        ? { backgroundImage: `url(${coverColor})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: coverColor };


    return (
        <div className="book-card" onClick={handleCardClick}>
            <div className="book-cover" style={coverStyle} />
            <div className="book-info">
                <div className="book-header">
                    <h3 className="book-title">{title}</h3>
                    <button
                        className={`book-favorite ${favorite ? "active" : ""}`}
                        onClick={handleFavoriteClick}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill={favorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                </div>
                <div className="book-author">{author}</div>
                {rating > 0 && (
                    <div className="book-rating">
                        {renderStars(rating)}
                        <span>{rating.toFixed(1)}</span>
                        {totalReviews > 0 && (
                            <span style={{ fontSize: '0.85em', color: '#94a3b8', marginLeft: '0.25rem' }}>
                                ({totalReviews})
                            </span>
                        )}
                    </div>
                )}
                <p className="book-desc">{description}</p>
                {loanStatus ? (
                    <button
                        className="btn-pinjam"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/siswa/detail?id=${id}`);
                        }}
                        style={{ background: '#6b7280', opacity: 0.85 }}
                    >
                        {loanStatus === 'PENDING' ? 'Lihat Status' :
                            loanStatus === 'APPROVED' ? 'Lihat Detail' : 'Lihat Detail'}
                    </button>
                ) : (
                    <button className="btn-pinjam" onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/siswa/detail?id=${id}`);
                    }}>
                        Lihat Detail
                    </button>
                )}
            </div>
        </div>
    );
}
