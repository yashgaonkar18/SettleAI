import SideBar from "@/components/dashboard/SideBar";
import AuthGuard from "@/components/auth/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#faf9f6]">
        <SideBar />

        <main className="ml-60 min-h-screen min-w-0">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}