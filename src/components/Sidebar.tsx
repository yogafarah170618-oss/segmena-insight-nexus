import { Home, Upload, BarChart3, Target } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import segmenaLogo from "@/assets/segmena-logo.png";

const navItems = [
  { title: "Home", icon: Home, path: "/" },
  { title: "Upload Data", icon: Upload, path: "/upload" },
  { title: "Dashboard", icon: BarChart3, path: "/dashboard" },
  { title: "Segments", icon: Target, path: "/segments" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 glass-card-strong border-r border-border z-50">
      <div className="flex flex-col items-center py-8 space-y-8">
        {/* Logo */}
        <NavLink to="/" className="mb-4">
          <img src={segmenaLogo} alt="Segmena" className="w-20 h-20 object-contain" />
        </NavLink>

        {/* Navigation */}
        <nav className="flex flex-col items-center space-y-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                "hover:bg-primary/10 hover:glow-effect"
              )}
              activeClassName="bg-primary/20 glow-effect"
            >
              <item.icon className="w-6 h-6" />
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
