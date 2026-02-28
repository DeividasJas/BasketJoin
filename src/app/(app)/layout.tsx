import Header from "@/components/header";
import Footer from "@/components/footer";
import ThemeChanger from "@/components/themeChangeBtn";
import { dynamicNavLinksFunction } from "@/lib/utils";
import { auth } from "@/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAuth = !!session?.user;
  const userRole = session?.user?.role || "PLAYER";
  const { navLinks } = await dynamicNavLinksFunction(isAuth);

  return (
    <>
      <Header
        isAuthenticated={isAuth}
        navLinksArray={navLinks}
        userRole={userRole}
      />
      <ThemeChanger />
      {children}
      <Footer />
    </>
  );
}
