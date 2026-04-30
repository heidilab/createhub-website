import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[calc(5px+76px)] bg-brand-bg">
        {children}
      </main>
      <Footer />
    </>
  );
}
