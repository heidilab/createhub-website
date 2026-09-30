import Script from "next/script";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { hasPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasNews = await hasPublishedArticles();
  return (
    <>
      <Navbar hasNews={hasNews} />
      <main className="min-h-screen pt-[calc(5px+72px)]">{children}</main>
      <Footer hasNews={hasNews} />
      {/* Third-party visitor map — public pages only, never on /admin, /dashboard or auth pages */}
      <Script
        src="https://glomap.vercel.app/api/embed/oKStrV8dh1tmedLVyORj/glomap.js"
        strategy="afterInteractive"
      />
    </>
  );
}
