"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import "@/app/dashboard.css";

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isPesanPage = pathname?.startsWith("/admin/pesan");

    if (isPesanPage) {
        return <>{children}</>;
    }

    return (
        <div className="dashboard">
            <AdminSidebar />
            <main className="main-content">{children}</main>
        </div>
    );
}
