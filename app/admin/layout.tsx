import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "管理員後台",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <AdminSidebar adminName={user.fullName || user.email} />
      {/* Sidebar is fixed; offset content on lg+ by sidebar width */}
      <main className="lg:pl-64 min-w-0">{children}</main>
    </div>
  );
}
