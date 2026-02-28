import { redirect } from "next/navigation";
import DashboardNavList from "@/components/dashboardNavList";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has ADMIN or ORGANIZER role
  const userRole = session.user.role;
  const hasAdminAccess = userRole === "ADMIN" || userRole === "ORGANIZER";

  if (!hasAdminAccess) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardNavList />
      {children}
    </div>
  );
}
