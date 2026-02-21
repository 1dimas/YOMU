"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AppTour from "@/components/AppTour";
import type { TourStep } from "@/components/AppTour";
import { useAuth } from "@/lib/auth-context";
import "@/app/dashboard.css";

const siswaSteps: TourStep[] = [
    {
        target: ".search-bar",
        title: "Cari Buku",
        description: "Ketik judul, penulis, atau kategori untuk menemukan buku yang kamu cari dengan cepat.",
        placement: "bottom",
    },
    {
        target: ".book-card:first-child",
        title: "Kartu Buku",
        description: "Klik kartu buku untuk melihat detail, sinopsis, dan ulasan dari pembaca lain.",
        placement: "bottom",
    },
    {
        target: '.sidebar-nav-item[href="/siswa/peminjaman"]',
        title: "Riwayat Peminjaman",
        description: "Lihat status peminjaman, pengembalian, dan riwayat buku yang pernah kamu pinjam.",
        placement: "right",
    },
    {
        target: ".notification-wrapper",
        title: "Notifikasi",
        description: "Cek pesan dari admin dan pemberitahuan terbaru tentang status peminjaman kamu.",
        placement: "bottom",
    },
    {
        target: ".user-profile",
        title: "Profil Kamu",
        description: "Lihat dan edit informasi profil, atau keluar dari akun kamu.",
        placement: "bottom",
    },
];

export default function SiswaLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const pathname = usePathname();
    const isDetailPage = pathname?.startsWith("/siswa/detail");
    const isPesanPage = pathname?.startsWith("/siswa/pesan");
    const isDashboard = pathname === "/siswa";
    const tourKey = user?.id ? `yomu_tour_done_v1_${user.id}` : null;

    if (isPesanPage) {
        return <>{children}</>;
    }

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                {!isDetailPage && <Header />}
                {children}
            </main>
            {isDashboard && tourKey && <AppTour steps={siswaSteps} storageKey={tourKey} />}
        </div>
    );
}
