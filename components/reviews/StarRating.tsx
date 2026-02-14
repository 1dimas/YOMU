import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    setRating?: (rating: number) => void;
    editable?: boolean;
    size?: number;
}

export default function StarRating({ rating, setRating, editable = false, size = 20 }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <div
                    key={star}
                    style={{ cursor: editable ? 'pointer' : 'default' }}
                    onMouseEnter={() => editable && setHoverRating(star)}
                    onMouseLeave={() => editable && setHoverRating(0)}
                    onClick={() => editable && setRating && setRating(star)}
                >
                    <StarIcon
                        filled={star <= (hoverRating || rating)}
                        size={size}
                        color={star <= (hoverRating || rating) ? "#fbbf24" : "#e2e8f0"} // Amber-400 : Slate-200
                    />
                </div>
            ))}
        </div>
    );
}

function StarIcon({ filled, size, color }: { filled: boolean; size: number; color: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
