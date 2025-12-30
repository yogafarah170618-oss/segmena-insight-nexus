import { Sidebar } from "./Sidebar";
import { AuthButton } from "./AuthButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'ml-0 pt-16' : 'ml-16'}`}>
        <div className={`fixed z-50 ${isMobile ? 'top-4 right-4' : 'top-4 right-4'}`}>
          <AuthButton />
        </div>
        {children}
      </main>
    </div>
  );
};
