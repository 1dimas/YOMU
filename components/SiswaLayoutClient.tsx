"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import "@/app/dashboard.css";

export default function SiswaLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isDetailPage = pathname?.startsWith("/siswa/detail");
    const isPesanPage = pathname?.startsWith("/siswa/pesan");

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
        </div>
    );
}
