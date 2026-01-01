import { Sidebar } from "./Sidebar";
import { AuthButton } from "./AuthButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'ml-0 pt-14' : 'ml-16'} ${isLandingPage && isMobile ? 'pt-0' : ''}`}>
        <div className={`fixed z-50 ${isMobile ? 'top-3 right-3' : 'top-4 right-4'}`}>
          <AuthButton />
        </div>
        {children}
      </main>
    </div>
  );
};
