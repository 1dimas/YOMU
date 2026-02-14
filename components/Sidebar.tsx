"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/types";


const menuItems = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
        label: "Dashboard",
        href: "/siswa",
        color: "default",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        ),
        label: "Buku Favorit",
        href: "/siswa/favorit",
        color: "pink",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
        label: "Peminjaman",
        href: "/siswa/peminjaman",
        color: "default",
    },
];

// Default colors for categories
const categoryColors = [
    "#4fd1c5", // teal
    "#f6ad55", // orange
    "#68d391", // green
    "#90cdf4", // blue
    "#fc8181", // red
    "#b794f4", // purple
    "#fbb6ce", // pink
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoriesApi.getAll();
                setCategories(res.data || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);


    const handleLogout = async () => {
        try {
            await logout();
            router.replace("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    const isActive = (href: string) => {
        if (href === "/siswa") {
            return pathname === "/siswa";
        }
        return pathname.startsWith(href);
    };

    const getActiveClassName = (item: typeof menuItems[0]) => {
        if (!isActive(item.href)) return "";
        if (item.color === "pink") return "pink-active";
        if (item.color === "green") return "green-active";
        return "active";
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                </div>
                <span className="sidebar-logo-text">YOMU</span>
            </div>

            {/* Menu Utama */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Menu Utama</div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-nav-item ${getActiveClassName(item)}`}
                        >
                            <span className={`nav-icon ${item.color === "pink" ? "pink-icon" : ""}`}>
                                {item.icon}
                            </span>
                            {item.label}

                        </Link>
                    ))}
                </nav>
            </div>

            {/* Kategori Buku */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Kategori</div>
                <div className="sidebar-tipe">
                    {categories.slice(0, 6).map((cat, index) => (
                        <Link
                            key={cat.id}
                            href={`/siswa/katalog?category=${cat.id}`}
                            className="tipe-item"
                            style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                        >
                            <span
                                className="tipe-dot"
                                style={{ backgroundColor: cat.color || categoryColors[index % categoryColors.length] }}
                            />
                            {cat.name}
                        </Link>
                    ))}
                    {categories.length > 6 && (
                        <Link
                            href="/siswa/katalog"
                            className="tipe-item"
                            style={{ textDecoration: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            Lihat semua...
                        </Link>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button className="sidebar-logout" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Keluar
                </button>
            </div>

        </aside>
    );
}

