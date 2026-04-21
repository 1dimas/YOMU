'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Using Next.js searchParams hook to get ?token=ABC
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const router = useRouter();

    useEffect(() => {
        if (!token) {
            toast.error('Token tidak valid atau tidak ditemukan');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Token reset password tidak ditemukan');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Konfirmasi password tidak cocok');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.resetPassword(token, newPassword);
            toast.success(response.message || 'Password berhasil diubah!');
            setIsSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal mereset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '1.5rem'
                }}>
                    ✓
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#16a34a', marginBottom: '0.5rem' }}>
                    Berhasil!
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '2rem' }}>
                    Password Anda telah berhasil diubah. Mengalihkan ke halaman login...
                </p>
                <Link href="/login" style={{
                    display: 'inline-block',
                    background: '#16a34a',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.2)'
                }}>
                    Login Sekarang
                </Link>
            </div>
        );
    }

    if (!token) {
        return (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '3rem' }}>
                    ⚠️
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#b91c1c', marginBottom: '1rem' }}>
                    Link Tidak Valid
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#4b5563', textDecoration: 'none' }}>
                    Link reset password tidak valid atau kedaluwarsa.
                </p>
                <Link href="/forgot-password" style={{ display: 'inline-block', marginTop: '1rem', color: '#16a34a' }}>
                    Minta Link Baru
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                }}>
                    Password Baru
                </label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        background: 'rgba(255,255,255,0.8)'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#22c55e';
                        e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                    }}
                    required
                />
            </div>

            <div>
                <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                }}>
                    Konfirmasi Password Baru
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        background: 'rgba(255,255,255,0.8)'
                    }}
                    onFocus={(e) => {
                        // match with previous input
                        const borderC = newPassword !== '' && confirmPassword !== '' && newPassword !== confirmPassword ? '#ef4444' : '#22c55e';
                        e.target.style.borderColor = borderC;
                        e.target.style.boxShadow = `0 0 0 3px ${borderC === '#ef4444' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'}`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                    }}
                    required
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Password tidak cocok
                    </span>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading || (newPassword !== confirmPassword && confirmPassword !== '')}
                style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: isLoading || (newPassword !== confirmPassword && confirmPassword !== '') ? '#9ca3af' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isLoading || (newPassword !== confirmPassword && confirmPassword !== '') ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    marginTop: '0.5rem',
                    boxShadow: isLoading ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.2)'
                }}
                onMouseOver={(e) => {
                    if (!isLoading && newPassword === confirmPassword) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                    if (!isLoading) e.currentTarget.style.transform = 'none';
                }}
            >
                {isLoading ? 'Memproses...' : 'Simpan Password Baru'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.5rem',
                    padding: '2.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.8)'
                }}
            >
                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)'
                    }}>
                        <span style={{ fontSize: '2rem', color: 'white' }}>🔒</span>
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.025em'
                    }}>
                        Reset Password
                    </h1>
                    <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                        Silakan buat password baru untuk akun Anda.
                    </p>
                </div>

                <Suspense fallback={<div style={{ textAlign: 'center', color: '#6b7280' }}>Memuat form...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </motion.div>
        </div>
    );
}
