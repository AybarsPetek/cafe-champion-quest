import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Library, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { path: "/", label: "Ana Sayfa", icon: Home },
  { path: "/courses", label: "Eğitimler", icon: BookOpen },
  { path: "/library", label: "Kütüphane", icon: Library },
  { path: "/forum", label: "Forum", icon: MessageCircle },
  { path: "/dashboard", label: "Panelim", icon: User },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 border-t border-border pb-[env(safe-area-inset-bottom)]"
      aria-label="Alt navigasyon"
    >
      <ul className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center h-full gap-1 text-[11px] transition-colors",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
