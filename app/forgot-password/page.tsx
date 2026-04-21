'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Email tidak boleh kosong');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.forgotPassword(email);
            toast.success(response.message || 'Instruksi reset password terkirim!');
            setIsSuccess(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal mengirim instruksi');
        } finally {
            setIsLoading(false);
        }
    };

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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
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
                        <span style={{ fontSize: '2rem', color: 'white' }}>📚</span>
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.025em'
                    }}>
                        Lupa Password
                    </h1>
                    <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                        Masukkan email terdaftar Anda untuk menerima link reset password.
                    </p>
                </div>

                {isSuccess ? (
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
                            Email Terkirim!
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '2rem' }}>
                            Silakan cek inbox (atau folder spam) email Anda untuk langkah selanjutnya.
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
                            Kembali ke Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                marginTop: '0.5rem',
                                boxShadow: isLoading ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.2)'
                            }}
                            onMouseOver={(e) => {
                                if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                                if (!isLoading) e.currentTarget.style.transform = 'none';
                            }}
                        >
                            {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link href="/login" style={{
                                fontSize: '0.9rem',
                                color: '#16a34a',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}>
                                Kembali ke Halaman Login
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
