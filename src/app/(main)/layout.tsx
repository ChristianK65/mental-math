import { Navbar } from "@/components/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f3ea] text-[#151515]">
      <div className="mx-auto w-full max-w-6xl px-6 pt-8 sm:px-10">
        <Navbar />
      </div>
      {children}
    </div>
  );
}
