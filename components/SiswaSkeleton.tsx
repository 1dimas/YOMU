"use client";

function SkeletonBox({ width, height, borderRadius, style }: {
    width?: string; height?: string; borderRadius?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div className="skeleton-shimmer" style={{
            width: width || "100%",
            height: height || "1rem",
            borderRadius: borderRadius || "0.375rem",
            ...style,
        }} />
    );
}

function SkeletonBookCard() {
    return (
        <div style={{
            background: "white", borderRadius: "1rem", overflow: "hidden",
            border: "1px solid #e5e7eb",
        }}>
            <SkeletonBox width="100%" height="200px" borderRadius="0" />
            <div style={{ padding: "1rem" }}>
                <SkeletonBox width="80%" height="0.875rem" style={{ marginBottom: "0.5rem" }} />
                <SkeletonBox width="50%" height="0.75rem" style={{ marginBottom: "0.75rem" }} />
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <SkeletonBox width="60px" height="0.625rem" />
                    <SkeletonBox width="40px" height="0.625rem" />
                </div>
            </div>
        </div>
    );
}

function SkeletonStatCard() {
    return (
        <div style={{
            background: "white", padding: "1.5rem", borderRadius: "1rem",
            border: "1px solid #f3f4f6",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "120px",
        }}>
            <div>
                <SkeletonBox width="60%" height="0.75rem" style={{ marginBottom: "0.5rem" }} />
                <SkeletonBox width="40%" height="2rem" borderRadius="0.5rem" />
            </div>
            <SkeletonBox width="40px" height="40px" borderRadius="0.75rem" style={{ alignSelf: "flex-end", marginTop: "-1rem" }} />
        </div>
    );
}

function SkeletonLoanCard() {
    return (
        <div style={{
            background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb",
            overflow: "hidden",
        }}>
            <div style={{ display: "flex", padding: "1rem", gap: "1rem", borderBottom: "1px solid #f3f4f6" }}>
                <SkeletonBox width="80px" height="110px" borderRadius="0.5rem" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <SkeletonBox width="80px" height="1.25rem" borderRadius="9999px" />
                    <SkeletonBox width="90%" height="1rem" />
                    <SkeletonBox width="60%" height="0.75rem" />
                </div>
            </div>
            <div style={{ padding: "1rem", background: "#f9fafb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <SkeletonBox width="100px" height="0.75rem" />
                    <SkeletonBox width="80px" height="0.75rem" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <SkeletonBox width="90px" height="0.75rem" />
                    <SkeletonBox width="80px" height="0.75rem" />
                </div>
                <SkeletonBox width="100%" height="2.5rem" borderRadius="0.5rem" />
            </div>
        </div>
    );
}

interface SiswaSkeletonProps {
    variant: "dashboard" | "katalog" | "favorit" | "peminjaman" | "peraturan" | "detail";
}

export default function SiswaSkeleton({ variant }: SiswaSkeletonProps) {
    if (variant === "dashboard") {
        return (
            <div className="dashboard-content skeleton-container">
                {/* Greeting */}
                <div className="greeting">
                    <SkeletonBox width="220px" height="1.75rem" style={{ marginBottom: "0.5rem" }} />
                    <SkeletonBox width="160px" height="0.875rem" />
                </div>

                {/* Stats + Kategori */}
                <div className="stats-row">
                    <div className="stats-section">
                        <div className="stats-cards">
                            <div className="stat-card">
                                <div className="stat-icon primary">
                                    <SkeletonBox width="24px" height="24px" borderRadius="0.25rem" />
                                </div>
                                <div className="stat-info">
                                    <SkeletonBox width="40px" height="1.5rem" style={{ marginBottom: "0.375rem" }} />
                                    <SkeletonBox width="120px" height="0.625rem" />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon warning">
                                    <SkeletonBox width="24px" height="24px" borderRadius="0.25rem" />
                                </div>
                                <div className="stat-info">
                                    <SkeletonBox width="60px" height="1.5rem" style={{ marginBottom: "0.375rem" }} />
                                    <SkeletonBox width="140px" height="0.625rem" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="kategori-section">
                        <SkeletonBox width="100px" height="0.75rem" style={{ marginBottom: "0.75rem" }} />
                        <div className="kategori-list">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="kategori-item">
                                    <SkeletonBox width="40px" height="40px" borderRadius="0.75rem" />
                                    <SkeletonBox width="50px" height="0.625rem" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Book Grid */}
                <section className="book-section">
                    <div className="section-header">
                        <SkeletonBox width="200px" height="1.125rem" />
                        <SkeletonBox width="80px" height="0.75rem" />
                    </div>
                    <div className="book-grid">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonBookCard key={i} />
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    if (variant === "katalog") {
        return (
            <div className="dashboard-content skeleton-container">
                {/* Header */}
                <div className="page-header">
                    <SkeletonBox width="180px" height="1.5rem" style={{ marginBottom: "0.5rem" }} />
                    <SkeletonBox width="320px" height="0.875rem" />
                </div>

                {/* Search + Filters */}
                <div className="filters-row">
                    <div className="search-filter" style={{ flex: 1 }}>
                        <SkeletonBox width="100%" height="2.5rem" borderRadius="0.5rem" />
                    </div>
                    <div className="kategori-filter" style={{ display: "flex", gap: "0.5rem" }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonBox key={i} width="100px" height="2.25rem" borderRadius="9999px" />
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="results-info">
                    <SkeletonBox width="200px" height="0.75rem" />
                </div>

                {/* Book Grid */}
                <div className="book-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonBookCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "favorit") {
        return (
            <div className="dashboard-content skeleton-container">
                {/* Header */}
                <div className="favorit-header">
                    <SkeletonBox width="240px" height="1.5rem" />
                    <div className="sort-control" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <SkeletonBox width="80px" height="0.75rem" />
                        <SkeletonBox width="160px" height="2.25rem" borderRadius="0.5rem" />
                    </div>
                </div>

                {/* Book Grid */}
                <div className="book-grid">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonBookCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "peminjaman") {
        return (
            <div className="dashboard-content skeleton-container" style={{ paddingBottom: "4rem" }}>
                {/* Header */}
                <div style={{ marginBottom: "2rem" }}>
                    <SkeletonBox width="220px" height="1.75rem" style={{ marginBottom: "0.5rem" }} />
                    <SkeletonBox width="360px" height="0.875rem" />
                </div>

                {/* Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
                    <SkeletonStatCard />
                    <SkeletonStatCard />
                    <SkeletonStatCard />
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid #e5e7eb" }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonBox key={i} width="90px" height="2.25rem" borderRadius="9999px" />
                    ))}
                </div>

                {/* Loan Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonLoanCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "peraturan") {
        return (
            <div className="skeleton-container" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
                {/* Back button */}
                <div style={{ marginBottom: "2rem" }}>
                    <SkeletonBox width="100px" height="2.25rem" borderRadius="9999px" />
                </div>

                {/* Content */}
                <div style={{ background: "white", borderRadius: "1rem", padding: "2rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <SkeletonBox width="48px" height="48px" borderRadius="0.75rem" />
                        <div>
                            <SkeletonBox width="200px" height="1.25rem" style={{ marginBottom: "0.375rem" }} />
                            <SkeletonBox width="260px" height="0.75rem" />
                        </div>
                    </div>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <SkeletonBox
                            key={i}
                            width={`${40 + Math.random() * 55}%`}
                            height="0.75rem"
                            style={{ marginBottom: "0.875rem" }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "detail") {
        return (
            <div className="skeleton-container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
                {/* Back Button */}
                <SkeletonBox width="160px" height="2.25rem" borderRadius="10px" style={{ marginBottom: "2rem" }} />

                {/* Hero */}
                <div style={{
                    display: "flex", gap: "3rem", background: "white", borderRadius: "20px",
                    padding: "2.5rem", border: "1px solid #e5e7eb",
                }}>
                    {/* Cover */}
                    <SkeletonBox width="220px" height="320px" borderRadius="14px" style={{ flexShrink: 0 }} />

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        {/* Badges */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            <SkeletonBox width="80px" height="1.5rem" borderRadius="8px" />
                            <SkeletonBox width="100px" height="1.5rem" borderRadius="8px" />
                            <SkeletonBox width="90px" height="1.5rem" borderRadius="8px" />
                        </div>
                        <SkeletonBox width="80%" height="1.75rem" style={{ marginBottom: "6px" }} />
                        <SkeletonBox width="40%" height="1rem" style={{ marginBottom: "24px" }} />

                        {/* Info Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: "12px" }}>
                                    <SkeletonBox width="50%" height="0.625rem" style={{ marginBottom: "6px" }} />
                                    <SkeletonBox width="75%" height="0.875rem" />
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", gap: "10px" }}>
                            <SkeletonBox width="180px" height="3rem" borderRadius="12px" />
                            <SkeletonBox width="48px" height="48px" borderRadius="12px" />
                            <SkeletonBox width="120px" height="3rem" borderRadius="12px" />
                        </div>
                    </div>
                </div>

                {/* Synopsis */}
                <div style={{ marginTop: "2rem", background: "white", borderRadius: "16px", padding: "2rem", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <SkeletonBox width="32px" height="32px" borderRadius="8px" />
                        <SkeletonBox width="80px" height="1rem" />
                    </div>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonBox
                            key={i}
                            width={`${60 + Math.random() * 35}%`}
                            height="0.875rem"
                            style={{ marginBottom: "0.75rem" }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
