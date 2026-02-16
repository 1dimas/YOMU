"use client";

interface AdminSkeletonProps {
    variant: "dashboard" | "table" | "peminjaman" | "laporan" | "peraturan";
    columns?: number;
    rows?: number;
}

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

function SkeletonStatCard() {
    return (
        <div className="admin-stat-card" style={{ padding: "1.5rem" }}>
            <div className="stat-content" style={{ gap: "0.75rem", display: "flex", flexDirection: "column" }}>
                <SkeletonBox width="60%" height="0.75rem" />
                <SkeletonBox width="40%" height="2rem" borderRadius="0.5rem" />
                <SkeletonBox width="80%" height="0.625rem" />
            </div>
            <div style={{ width: 48, height: 48, borderRadius: "0.75rem" }}>
                <SkeletonBox width="48px" height="48px" borderRadius="0.75rem" />
            </div>
        </div>
    );
}

function SkeletonTableRow({ columns, rowIndex = 0 }: { columns: number; rowIndex?: number }) {
    return (
        <tr>
            {Array.from({ length: columns }).map((_, i) => {
                // Use deterministic widths based on column index instead of Math.random()
                const widths = [65, 45, 75, 55, 70, 60];
                const width = widths[(rowIndex * columns + i) % widths.length];
                
                return (
                    <td key={i} style={{ padding: "1rem 0.75rem" }}>
                        {i === 1 ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <SkeletonBox width="32px" height="32px" borderRadius="50%" />
                                <SkeletonBox width="70%" height="0.875rem" />
                            </div>
                        ) : (
                            <SkeletonBox
                                width={i === 0 ? "60px" : i === columns - 1 ? "40px" : `${width}%`}
                                height="0.875rem"
                            />
                        )}
                    </td>
                );
            })}
        </tr>
    );
}

function SkeletonTable({ columns, rows }: { columns: number; rows: number }) {
    // Deterministic widths instead of Math.random() to prevent hydration mismatches
    const headerWidths = [60, 48, 70, 65, 58, 62];
    
    return (
        <div className="data-table-container" style={{ opacity: 1 }}>
            <table className="data-table">
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i}>
                                <SkeletonBox width={`${headerWidths[i % headerWidths.length]}%`} height="0.625rem" style={{ opacity: 0.5 }} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} rowIndex={i} />
                    ))}
                </tbody>
            </table>
            <div className="data-table-footer">
                <SkeletonBox width="180px" height="0.75rem" />
            </div>
        </div>
    );
}

export default function AdminSkeleton({ variant, columns, rows = 5 }: AdminSkeletonProps) {
    if (variant === "dashboard") {
        return (
            <div className="admin-content skeleton-container">
                {/* Welcome Card Skeleton */}
                <div className="admin-welcome-card" style={{ minHeight: "120px" }}>
                    <SkeletonBox width="50%" height="1.5rem" style={{ marginBottom: "0.75rem" }} />
                    <SkeletonBox width="80%" height="0.875rem" style={{ marginBottom: "0.5rem" }} />
                    <SkeletonBox width="140px" height="2.25rem" borderRadius="0.5rem" />
                </div>

                {/* Stats Row Skeleton */}
                <div className="admin-stats-row">
                    <SkeletonStatCard />
                    <SkeletonStatCard />
                    <SkeletonStatCard />
                </div>

                {/* Table Skeleton */}
                <div className="admin-table-container">
                    <div className="table-header">
                        <div className="table-title" style={{ gap: "0.5rem" }}>
                            <SkeletonBox width="20px" height="20px" borderRadius="50%" />
                            <SkeletonBox width="160px" height="1rem" />
                        </div>
                        <SkeletonBox width="100px" height="0.875rem" />
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <th key={i}>
                                        <SkeletonBox width={`${40 + Math.random() * 40}%`} height="0.625rem" style={{ opacity: 0.5 }} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: rows }).map((_, i) => (
                                <SkeletonTableRow key={i} columns={6} />
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">
                        <SkeletonBox width="200px" height="0.75rem" />
                    </div>
                </div>
            </div>
        );
    }

    if (variant === "table") {
        const cols = columns || 6;
        return (
            <div className="admin-content skeleton-container">
                {/* Toolbar Skeleton */}
                <div className="data-toolbar">
                    <div className="data-search" style={{ flex: 1 }}>
                        <SkeletonBox width="100%" height="2.5rem" borderRadius="0.5rem" />
                    </div>
                    <SkeletonBox width="160px" height="2.5rem" borderRadius="0.5rem" />
                </div>

                <SkeletonTable columns={cols} rows={rows} />
            </div>
        );
    }

    if (variant === "peminjaman") {
        return (
            <div className="admin-content skeleton-container">
                {/* Quick Stats Skeleton */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{
                            padding: "1rem", borderRadius: "0.5rem", flex: 1,
                            minWidth: "200px",
                        }}>
                            <SkeletonBox width="100%" height="2.5rem" borderRadius="0.5rem" />
                        </div>
                    ))}
                </div>

                {/* Filter Tabs + Search Skeleton */}
                <div className="peminjaman-toolbar">
                    <div className="filter-tabs" style={{ display: "flex", gap: "0.5rem" }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonBox key={i} width="100px" height="2.25rem" borderRadius="0.5rem" />
                        ))}
                    </div>
                    <div className="data-search">
                        <SkeletonBox width="100%" height="2.5rem" borderRadius="0.5rem" />
                    </div>
                </div>

                <SkeletonTable columns={7} rows={rows} />
            </div>
        );
    }

    if (variant === "laporan") {
        return (
            <div className="admin-content skeleton-container">
                {/* Filter Toolbar Skeleton */}
                <div className="filter-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <SkeletonBox width="60px" height="0.875rem" />
                        <SkeletonBox width="140px" height="2.25rem" borderRadius="0.5rem" />
                        <SkeletonBox width="10px" height="0.75rem" />
                        <SkeletonBox width="140px" height="2.25rem" borderRadius="0.5rem" />
                        <SkeletonBox width="140px" height="2.25rem" borderRadius="0.5rem" />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <SkeletonBox width="80px" height="2.25rem" borderRadius="0.5rem" />
                        <SkeletonBox width="110px" height="2.25rem" borderRadius="0.5rem" />
                    </div>
                </div>

                <SkeletonTable columns={5} rows={rows} />
            </div>
        );
    }

    if (variant === "peraturan") {
        return (
            <div className="admin-content skeleton-container">
                {/* Section Header Skeleton */}
                <div className="page-section-header">
                    <div className="section-info">
                        <SkeletonBox width="280px" height="1.25rem" style={{ marginBottom: "0.5rem" }} />
                        <SkeletonBox width="360px" height="0.75rem" />
                    </div>
                    <div className="section-actions" style={{ display: "flex", gap: "0.5rem" }}>
                        <SkeletonBox width="120px" height="2.5rem" borderRadius="0.5rem" />
                        <SkeletonBox width="160px" height="2.5rem" borderRadius="0.5rem" />
                    </div>
                </div>

                {/* Two Column Grid Skeleton */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
                    <div style={{ background: "white", borderRadius: "0.75rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <SkeletonBox width="140px" height="0.875rem" style={{ marginBottom: "0.375rem" }} />
                            <SkeletonBox width="260px" height="0.625rem" />
                        </div>
                        <div style={{ padding: "1rem 1.25rem" }}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <SkeletonBox
                                    key={i}
                                    width={`${40 + Math.random() * 55}%`}
                                    height="0.75rem"
                                    style={{ marginBottom: "0.75rem" }}
                                />
                            ))}
                        </div>
                    </div>
                    <div style={{ background: "white", borderRadius: "0.75rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <SkeletonBox width="80px" height="0.875rem" style={{ marginBottom: "0.375rem" }} />
                            <SkeletonBox width="200px" height="0.625rem" />
                        </div>
                        <div style={{ padding: "1rem 1.25rem" }}>
                            <SkeletonBox width="50%" height="1.25rem" style={{ marginBottom: "1rem" }} />
                            {Array.from({ length: 8 }).map((_, i) => (
                                <SkeletonBox
                                    key={i}
                                    width={`${50 + Math.random() * 45}%`}
                                    height="0.75rem"
                                    style={{ marginBottom: "0.75rem" }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
