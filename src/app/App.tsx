import { useEffect, useState } from "react";
import { AdminPage } from "./pages/AdminPage";
import { PublicCatalogPage } from "./pages/PublicCatalogPage";

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  if (pathname.startsWith("/admin")) {
    return <AdminPage />;
  }

  return <PublicCatalogPage />;
}
