"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { majorsApi, classesApi } from "@/lib/api";
import { toast } from "sonner";

interface MasterDataItem {
    id: string;
    name: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        majorId: "",
        classId: "",
        password: "",
        confirmPassword: "",
    });

    // Master data from API
    const [majors, setMajors] = useState<MasterDataItem[]>([]);
    const [classes, setClasses] = useState<MasterDataItem[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    // Reset form saat component mount (fixes autofill issue on client-side navigation)
    useEffect(() => {
        setFormData({
            nama: "",
            email: "",
            majorId: "",
            classId: "",
            password: "",
            confirmPassword: "",
        });
        setError("");
    }, []);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [majorsRes, classesRes] = await Promise.all([
                    majorsApi.getAll(),
                    classesApi.getAll(),
                ]);
                setMajors(majorsRes.data || []);
                setClasses(classesRes.data || []);
            } catch (error) {
                console.error("Failed to fetch master data:", error);
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchMasterData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.email || !formData.password || !formData.nama) {
            toast.error("Email, nama, dan password wajib diisi");
            setError("Email, nama, dan password wajib diisi");
            return;
        }

        if (!formData.majorId || !formData.classId) {
            toast.error("Jurusan dan kelas wajib dipilih");
            setError("Jurusan dan kelas wajib dipilih");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Password dan konfirmasi password tidak sama");
            setError("Password dan konfirmasi password tidak sama");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password minimal 6 karakter");
            setError("Password minimal 6 karakter");
            return;
        }

        setIsLoading(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                name: formData.nama,
                majorId: formData.majorId,
                classId: formData.classId,
            });
            toast.success("Registrasi berhasil! Selamat datang di YOMU.");
            router.push("/siswa");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Registrasi gagal. Silakan coba lagi.";
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            <path d="M8 7h8" />
                            <path d="M8 11h6" />
                        </svg>
                    </div>
                    <h1 className="auth-title">YOMU</h1>
                    <p className="auth-subtitle">Daftar Anggota Baru</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message" style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#dc2626",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.5rem",
                        marginBottom: "1rem",
                        fontSize: "0.875rem"
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email Field - Required */}
                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="email@sekolah.sch.id"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>


                    {/* Nama Lengkap Field */}
                    <div className="form-group">
                        <label className="form-label">Nama Lengkap *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Masukkan nama lengkap"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Kelas & Jurusan Row */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Kelas <span style={{ color: "#ef4444" }}>*</span></label>
                            <div className="select-wrapper">
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                        </svg>
                                    </span>
                                    <select
                                        className="form-select"
                                        value={formData.classId}
                                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                        disabled={isLoading || isFetchingData}
                                        required
                                    >
                                        <option value="">{isFetchingData ? "Memuat..." : "Pilih Kelas"}</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <span className="select-arrow">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Jurusan <span style={{ color: "#ef4444" }}>*</span></label>
                            <div className="select-wrapper">
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <select
                                        className="form-select"
                                        value={formData.majorId}
                                        onChange={(e) => setFormData({ ...formData, majorId: e.target.value })}
                                        disabled={isLoading || isFetchingData}
                                        required
                                    >
                                        <option value="">{isFetchingData ? "Memuat..." : "Pilih Jurusan"}</option>
                                        {majors.map((m) => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                    <span className="select-arrow">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label className="form-label">Password *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Minimal 6 karakter"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="input-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="form-group">
                        <label className="form-label">Konfirmasi Password *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Ulangi password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="input-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    Sudah punya akun? <Link href="/login">Masuk di sini →</Link>
                </div>
            </div>

            {/* Copyright */}
            <p className="copyright">© 2026 YOMU Library System. All rights reserved.</p>
        </div>
    );
}
