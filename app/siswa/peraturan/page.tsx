"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

const DEFAULT_RULES = `
## Peraturan Peminjaman Buku Perpustakaan

### 1. Ketentuan Umum
- Setiap anggota perpustakaan berhak meminjam buku dengan kartu anggota yang masih berlaku.
- Maksimal peminjaman adalah **3 buku** sekaligus.
- Durasi peminjaman maksimal adalah **7 hari** kalender.

### 2. Prosedur Peminjaman
- Pilih buku yang ingin dipinjam melalui katalog.
- Klik tombol "Pinjam Buku" dan pilih durasi peminjaman.
- Tunggu persetujuan dari petugas perpustakaan.
- Setelah disetujui, ambil buku di meja layanan perpustakaan.

### 3. Pengembalian Buku
- Buku wajib dikembalikan sebelum atau pada tanggal jatuh tempo.
- Pengembalian dilakukan di meja layanan perpustakaan.
- Pastikan kondisi buku baik saat dikembalikan.

### 4. Keterlambatan & Denda
- Keterlambatan pengembalian dikenakan denda **Rp 1.000 per hari** per buku.
- Buku yang rusak atau hilang wajib diganti sesuai harga buku.

### 5. Larangan
- Dilarang memindahtangankan buku pinjaman kepada orang lain.
- Dilarang mencoret, melipat, atau merusak buku.
- Dilarang membawa makanan/minuman saat membaca di perpustakaan.

---

*Dengan meminjam buku, Anda menyetujui semua peraturan di atas.*
`;

export default function PeraturanPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [rules, setRules] = useState(DEFAULT_RULES);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        // Try to load custom rules from localStorage
        if (typeof window !== "undefined") {
            const customRules = localStorage.getItem("library_rules");
            if (customRules) {
                setRules(customRules);
            }
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading) {
        return (
            <div style={{ padding: "4rem", textAlign: "center" }}>
                <p>Memuat...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            {/* Back button */}
            <div style={{ marginBottom: "2rem" }}>
                <Link
                    href="/siswa/katalog"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#64748b",
                        textDecoration: "none",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        padding: "0.5rem 1rem",
                        background: "white",
                        borderRadius: "9999px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{ width: "18px", height: "18px" }}
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Kembali
                </Link>
            </div>

            {/* Content */}
            <div
                style={{
                    background: "white",
                    borderRadius: "1rem",
                    padding: "2rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "0.75rem",
                            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            style={{ width: "24px", height: "24px" }}
                        >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Peraturan Peminjaman</h1>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
                            Baca dan pahami sebelum meminjam buku
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        lineHeight: 1.8,
                        color: "#374151",
                        fontSize: "0.95rem",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: rules
                            .replace(/## (.*)/g, '<h2 style="font-size:1.25rem;font-weight:700;margin:1.5rem 0 0.75rem;color:#1e293b">$1</h2>')
                            .replace(/### (.*)/g, '<h3 style="font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;color:#334155">$1</h3>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/- (.*)/g, '<li style="margin-left:1.5rem;margin-bottom:0.25rem">$1</li>')
                            .replace(/\n\n/g, '<br/>')
                            .replace(/---/g, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0"/>')
                            .replace(/\*(.*?)\*/g, '<em style="color:#64748b">$1</em>'),
                    }}
                />
            </div>
        </div>
    );
}
