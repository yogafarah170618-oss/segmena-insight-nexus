import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      <main className="flex-1 ml-20">
        {children}
      </main>
    </div>
  );
};
