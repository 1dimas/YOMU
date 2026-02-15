"use client";

import { useCallback, useEffect, useRef } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
}

const variantStyles = {
    danger: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: 28, height: 28 }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
        ),
        iconBg: "#fef2f2",
        iconBorder: "#fecaca",
        btnBg: "#ef4444",
        btnHover: "#dc2626",
    },
    warning: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ width: 28, height: 28 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        iconBg: "#fffbeb",
        iconBorder: "#fde68a",
        btnBg: "#f59e0b",
        btnHover: "#d97706",
    },
    info: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ width: 28, height: 28 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
        iconBg: "#eff6ff",
        iconBorder: "#bfdbfe",
        btnBg: "#3b82f6",
        btnHover: "#2563eb",
    },
};

export default function ConfirmModal({
    isOpen,
    title = "Konfirmasi",
    message,
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const confirmBtnRef = useRef<HTMLButtonElement>(null);
    const style = variantStyles[variant];

    useEffect(() => {
        if (isOpen) {
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === "Escape") onCancel();
            };
            document.addEventListener("keydown", handleEsc);
            return () => document.removeEventListener("keydown", handleEsc);
        }
    }, [isOpen, onCancel]);

    const handleOverlayClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) onCancel();
        },
        [onCancel]
    );

    if (!isOpen) return null;

    return (
        <div
            onClick={handleOverlayClick}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                animation: "confirmFadeIn 0.15s ease-out",
            }}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: "16px",
                    width: "90%",
                    maxWidth: "420px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)",
                    animation: "confirmSlideIn 0.2s ease-out",
                    overflow: "hidden",
                }}
            >
                {/* Body */}
                <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
                    {/* Icon */}
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: style.iconBg,
                            border: `2px solid ${style.iconBorder}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                        }}
                    >
                        {style.icon}
                    </div>

                    <h3
                        style={{
                            margin: "0 0 8px",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#111827",
                        }}
                    >
                        {title}
                    </h3>
                    <p
                        style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            lineHeight: 1.6,
                            color: "#6b7280",
                        }}
                    >
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        padding: "16px 24px 20px",
                        justifyContent: "center",
                    }}
                >
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: "10px 20px",
                            borderRadius: "10px",
                            border: "1px solid #e5e7eb",
                            background: "white",
                            color: "#374151",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "white";
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: "10px 20px",
                            borderRadius: "10px",
                            border: "none",
                            background: style.btnBg,
                            color: "white",
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            boxShadow: `0 2px 8px ${style.btnBg}40`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = style.btnHover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = style.btnBg;
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes confirmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes confirmSlideIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
