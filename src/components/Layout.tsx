import { Sidebar } from "./Sidebar";
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
        {children}
      </main>
    </div>
  );
};
