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
    <div className="min-h-screen flex bg-brand-bg pt-[5px]">
      <AdminSidebar adminName={user.fullName || user.email} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
