"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/types";
import ProfileModal from "./ProfileModal";


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
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        ),
        label: "Buku Favorit",
        href: "/siswa/favorit",
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
    const searchParams = useSearchParams();
    const { user, logout } = useAuth();
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
                            <span className="nav-icon">
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
                <div className="sidebar-category-group">
                    {categories.slice(0, 6).map((cat) => {
                        const isCatActive = isActive(`/siswa/katalog`) && searchParams.get('category') === cat.id;
                        return (
                            <Link
                                key={cat.id}
                                href={`/siswa/katalog?category=${cat.id}`}
                                className={`sidebar-category-item ${isCatActive ? 'active' : ''}`}
                            >
                                {cat.name}
                            </Link>
                        );
                    })}
                    {categories.length > 6 && (
                        <Link
                            href="/siswa/katalog"
                            className="sidebar-category-item"
                            style={{ fontStyle: 'italic', fontSize: '0.85rem' }}
                        >
                            Lihat semua...
                        </Link>
                    )}
                </div>
            </div>

            {/* Footer — Panduan */}
            <div style={{
                marginTop: 'auto',
                padding: '1rem 1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
                <button
                    onClick={() => {
                        // Clear tour key for current user
                        const keys = Object.keys(localStorage);
                        keys.forEach(k => {
                            if (k.startsWith("yomu_tour_done_v1_")) localStorage.removeItem(k);
                        });
                        window.location.href = "/siswa";
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '0.6rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Panduan Aplikasi
                </button>
            </div>

        </aside>
    );
}

