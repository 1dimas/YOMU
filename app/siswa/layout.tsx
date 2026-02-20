import SiswaLayoutClient from "@/components/SiswaLayoutClient";

export default function SiswaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SiswaLayoutClient>{children}</SiswaLayoutClient>;
}
