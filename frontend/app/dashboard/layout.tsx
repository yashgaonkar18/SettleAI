// app/dashboard/layout.tsx
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import SideBar from "@/components/dashboard/SideBar";
import AuthGuard from "@/components/auth/AuthGuard";
import { createClient } from "@/lib/supabase/server";

async function RequireUser() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#faf9f6]">
        <SideBar />
        <main className="ml-60 min-h-screen min-w-0">{children}</main>
      </div>
      <Suspense fallback={null}>
        <RequireUser />
      </Suspense>
    </AuthGuard>
  );
}