"use client";

import AdminHeader from "@/components/AdminHeader";
import AdminSkeleton from "@/components/AdminSkeleton";
import ConfirmModal from "@/components/ConfirmModal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const DEFAULT_RULES = `## Peraturan Peminjaman Buku Perpustakaan

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

*Dengan meminjam buku, Anda menyetujui semua peraturan di atas.*`;

export default function AdminPeraturanPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [rules, setRules] = useState(DEFAULT_RULES);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
            router.push("/login");
            return;
        }

        // Load saved rules from localStorage
        if (typeof window !== "undefined") {
            const savedRules = localStorage.getItem("library_rules");
            if (savedRules) {
                setRules(savedRules);
            }
        }
    }, [authLoading, isAuthenticated, user?.role, router]);

    const handleSave = () => {
        setIsSaving(true);
        setSaveSuccess(false);

        // Save to localStorage
        localStorage.setItem("library_rules", rules);

        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 500);
    };

    const handleReset = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = () => {
        setRules(DEFAULT_RULES);
        localStorage.removeItem("library_rules");
        setShowResetConfirm(false);
    };

    if (authLoading) {
        return (
            <div className="admin-dashboard">
                <AdminHeader title="Peraturan Peminjaman" subtitle="Kelola Peraturan" />
                <AdminSkeleton variant="peraturan" />
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Peraturan Peminjaman" subtitle="Kelola Peraturan" />

            <div className="admin-content">
                <div className="page-section-header">
                    <div className="section-info">
                        <h2>Kelola Peraturan Peminjaman</h2>
                        <p>Edit peraturan yang akan dilihat siswa saat meminjam buku.</p>
                    </div>
                    <div className="section-actions" style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={handleReset}
                            style={{
                                padding: "0.75rem 1.25rem",
                                background: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.5rem",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "#64748b",
                            }}
                        >
                            Reset Default
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: saveSuccess ? "#10b981" : "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "0.5rem",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                cursor: isSaving ? "wait" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            {saveSuccess ? (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "18px", height: "18px" }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Tersimpan!
                                </>
                            ) : isSaving ? (
                                "Menyimpan..."
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "18px", height: "18px" }}>
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                        <polyline points="17 21 17 13 7 13 7 21" />
                                        <polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
                    {/* Editor */}
                    <div style={{ background: "white", borderRadius: "0.75rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>Editor Peraturan</h3>
                            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                                Gunakan format Markdown: ## untuk heading, **bold**, - untuk list
                            </p>
                        </div>
                        <textarea
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            style={{
                                width: "100%",
                                minHeight: "500px",
                                padding: "1rem 1.25rem",
                                border: "none",
                                resize: "vertical",
                                fontFamily: "monospace",
                                fontSize: "0.875rem",
                                lineHeight: 1.6,
                            }}
                            placeholder="Tulis peraturan peminjaman..."
                        />
                    </div>

                    {/* Preview */}
                    <div style={{ background: "white", borderRadius: "0.75rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>Preview</h3>
                            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                                Tampilan yang akan dilihat siswa
                            </p>
                        </div>
                        <div
                            style={{
                                padding: "1rem 1.25rem",
                                minHeight: "500px",
                                lineHeight: 1.8,
                                fontSize: "0.9rem",
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

                {/* Info box */}
                <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "#eff6ff", borderRadius: "0.75rem", border: "1px solid #bfdbfe" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#1e40af", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "18px", height: "18px", flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        Peraturan ini akan ditampilkan kepada siswa saat mereka mengklik link "syarat & ketentuan" pada popup peminjaman buku.
                    </p>
                </div>
            </div>

            <ConfirmModal
                isOpen={showResetConfirm}
                title="Reset Peraturan"
                message="Reset ke peraturan default? Semua perubahan yang telah disimpan akan hilang."
                confirmText="Ya, Reset"
                cancelText="Batal"
                variant="warning"
                onConfirm={confirmReset}
                onCancel={() => setShowResetConfirm(false)}
            />
        </div>
    );
}
