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
      <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-20'}`}>
        <div className="fixed top-4 right-4 z-50">
          <AuthButton />
        </div>
        {children}
      </main>
    </div>
  );
};
