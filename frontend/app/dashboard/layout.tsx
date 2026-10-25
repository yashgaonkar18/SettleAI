import SideBar from "@/components/dashboard/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <SideBar />

      <main className="ml-60 min-h-screen min-w-0">
        {children}
      </main>
    </div>
  );
}