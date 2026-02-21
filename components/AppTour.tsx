"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import "@/app/app-tour.css";

// ==================== TYPES ====================

export interface TourStep {
    target: string;       // CSS selector
    title: string;
    description: string;
    icon?: React.ReactNode;
    placement?: "top" | "bottom" | "left" | "right";
}

interface AppTourProps {
    steps: TourStep[];
    storageKey?: string;
    onComplete?: () => void;
}

type TourState = "idle" | "waitingTarget" | "active" | "completed";

interface SpotlightRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ==================== CONSTANTS ====================

const PADDING = 10;
const TOOLTIP_GAP = 16;
const POLL_INTERVAL = 100;
const POLL_TIMEOUT = 3000;

// ==================== DEFAULT ICONS ====================

const defaultIcons: Record<string, React.ReactNode> = {
    search: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    book: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    bell: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    default: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
};

// ==================== COMPONENT ====================

export default function AppTour({ steps, storageKey = "yomu_tour_done_v1", onComplete }: AppTourProps) {
    const [mounted, setMounted] = useState(false);
    const [state, setState] = useState<TourState>("idle");
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placement: string }>({ top: 0, left: 0, placement: "bottom" });

    const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollCountRef = useRef(0);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Hydration guard — only render on client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-start: check localStorage
    useEffect(() => {
        if (!mounted) return;
        const done = localStorage.getItem(storageKey);
        if (!done) {
            // Small delay to let the page render
            const t = setTimeout(() => startTour(), 800);
            return () => clearTimeout(t);
        }
    }, [mounted, storageKey]);

    // ==================== STATE MACHINE ====================

    const startTour = useCallback(() => {
        setCurrentStep(0);
        setState("waitingTarget");
    }, []);

    const completeTour = useCallback(() => {
        setState("completed");
        setSpotlight(null);
        localStorage.setItem(storageKey, "true");
        onComplete?.();
        // Reset to idle after animation
        setTimeout(() => setState("idle"), 300);
    }, [storageKey, onComplete]);

    const goToStep = useCallback((index: number) => {
        if (index < 0 || index >= steps.length) {
            completeTour();
            return;
        }
        setCurrentStep(index);
        setState("waitingTarget");
    }, [steps.length, completeTour]);

    // ==================== TARGET POLLING ====================

    useEffect(() => {
        if (state !== "waitingTarget") return;

        pollCountRef.current = 0;

        const poll = () => {
            const step = steps[currentStep];
            if (!step) {
                completeTour();
                return;
            }

            const el = document.querySelector(step.target) as HTMLElement;
            if (el) {
                // Scroll into view
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                // Wait for scroll to finish, then activate
                setTimeout(() => {
                    updatePosition(el, step.placement);
                    setState("active");
                }, 350);
                return;
            }

            pollCountRef.current += POLL_INTERVAL;
            if (pollCountRef.current >= POLL_TIMEOUT) {
                // Target not found — skip this step
                const nextIndex = currentStep + 1;
                if (nextIndex >= steps.length) {
                    completeTour();
                } else {
                    setCurrentStep(nextIndex);
                    // Stay in waitingTarget for next step
                }
                return;
            }

            pollTimerRef.current = setTimeout(poll, POLL_INTERVAL);
        };

        poll();

        return () => {
            if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        };
    }, [state, currentStep, steps, completeTour]);

    // ==================== POSITION CALCULATION ====================

    const updatePosition = useCallback((el: HTMLElement, preferredPlacement?: string) => {
        const rect = el.getBoundingClientRect();

        // Spotlight rect with padding
        const sRect: SpotlightRect = {
            x: rect.left - PADDING,
            y: rect.top - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
        };
        setSpotlight(sRect);

        // Calculate tooltip position
        const tooltipW = Math.min(340, window.innerWidth - 32);
        const tooltipH = 200; // estimated
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let placement = preferredPlacement || "bottom";
        let top = 0;
        let left = 0;

        // Auto-detect best placement if not specified
        if (!preferredPlacement) {
            const spaceBelow = vh - (rect.bottom + PADDING);
            const spaceAbove = rect.top - PADDING;
            const spaceRight = vw - (rect.right + PADDING);
            const spaceLeft = rect.left - PADDING;

            if (spaceBelow >= tooltipH + TOOLTIP_GAP) {
                placement = "bottom";
            } else if (spaceAbove >= tooltipH + TOOLTIP_GAP) {
                placement = "top";
            } else if (spaceRight >= tooltipW + TOOLTIP_GAP) {
                placement = "right";
            } else if (spaceLeft >= tooltipW + TOOLTIP_GAP) {
                placement = "left";
            } else {
                placement = "bottom";
            }
        }

        switch (placement) {
            case "bottom":
                top = rect.bottom + PADDING + TOOLTIP_GAP;
                left = rect.left + rect.width / 2 - tooltipW / 2;
                break;
            case "top":
                top = rect.top - PADDING - TOOLTIP_GAP - tooltipH;
                left = rect.left + rect.width / 2 - tooltipW / 2;
                break;
            case "right":
                top = rect.top + rect.height / 2 - tooltipH / 2;
                left = rect.right + PADDING + TOOLTIP_GAP;
                break;
            case "left":
                top = rect.top + rect.height / 2 - tooltipH / 2;
                left = rect.left - PADDING - TOOLTIP_GAP - tooltipW;
                break;
        }

        // Clamp within viewport
        left = Math.max(16, Math.min(left, vw - tooltipW - 16));
        top = Math.max(16, Math.min(top, vh - tooltipH - 16));

        setTooltipPos({ top, left, placement });
    }, []);

    // ==================== RESIZE / SCROLL LISTENERS ====================

    useEffect(() => {
        if (state !== "active") return;

        const recalc = () => {
            const step = steps[currentStep];
            if (!step) return;
            const el = document.querySelector(step.target) as HTMLElement;
            if (el) updatePosition(el, step.placement);
        };

        window.addEventListener("resize", recalc);
        window.addEventListener("scroll", recalc, true); // capture phase for nested scrolls
        return () => {
            window.removeEventListener("resize", recalc);
            window.removeEventListener("scroll", recalc, true);
        };
    }, [state, currentStep, steps, updatePosition]);

    // ==================== RENDER GUARD ====================

    if (!mounted) return null;
    if (state === "idle" || state === "completed") return null;
    if (state === "waitingTarget" && !spotlight) return null;

    const step = steps[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === steps.length - 1;

    // Pick icon
    const icon = step.icon || defaultIcons.default;

    // ==================== PORTAL RENDER ====================

    return createPortal(
        <>
            {/* SVG Overlay with Spotlight Cutout */}
            {spotlight && (
                <div className="tour-overlay" onClick={completeTour}>
                    <svg xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <mask id="tour-spotlight-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                <rect
                                    x={spotlight.x}
                                    y={spotlight.y}
                                    width={spotlight.width}
                                    height={spotlight.height}
                                    rx="12"
                                    ry="12"
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="rgba(0,0,0,0.6)"
                            mask="url(#tour-spotlight-mask)"
                        />
                        {/* Spotlight border glow */}
                        <rect
                            x={spotlight.x}
                            y={spotlight.y}
                            width={spotlight.width}
                            height={spotlight.height}
                            rx="12"
                            ry="12"
                            fill="none"
                            stroke="rgba(16,185,129,0.5)"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            )}

            {/* Tooltip Card */}
            {state === "active" && step && (
                <div
                    className="tour-tooltip"
                    ref={tooltipRef}
                    style={{ top: tooltipPos.top, left: tooltipPos.left }}
                >
                    {/* Arrow */}
                    <div className={`tour-arrow tour-arrow-${tooltipPos.placement === "bottom" ? "bottom" : tooltipPos.placement === "top" ? "top" : tooltipPos.placement === "left" ? "left" : "right"}`} />

                    {/* Header */}
                    <div className="tour-tooltip-header">
                        <div className="tour-tooltip-icon">
                            {icon}
                        </div>
                        <h3 className="tour-tooltip-title">{step.title}</h3>
                    </div>

                    {/* Body */}
                    <div className="tour-tooltip-body">
                        <p className="tour-tooltip-desc">{step.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="tour-tooltip-footer">
                        {/* Step Dots */}
                        <div className="tour-dots">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`tour-dot ${i === currentStep ? "active" : i < currentStep ? "done" : ""}`}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="tour-nav-buttons">
                            {isFirst ? (
                                <button className="tour-btn tour-btn-skip" onClick={completeTour}>
                                    Lewati
                                </button>
                            ) : (
                                <button className="tour-btn tour-btn-back" onClick={() => goToStep(currentStep - 1)}>
                                    Kembali
                                </button>
                            )}

                            {isLast ? (
                                <button className="tour-btn tour-btn-finish" onClick={completeTour}>
                                    Selesai ✓
                                </button>
                            ) : (
                                <button className="tour-btn tour-btn-next" onClick={() => goToStep(currentStep + 1)}>
                                    Lanjut →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>,
        document.body
    );
}
