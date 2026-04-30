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
    </>
  );
}
