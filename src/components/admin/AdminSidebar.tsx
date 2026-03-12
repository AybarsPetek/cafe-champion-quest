import { useLocation, useNavigate } from "react-router-dom";
import {
  UserCheck,
  BookOpen,
  Video,
  HelpCircle,
  Award,
  CreditCard,
  Building,
  ClipboardList,
  Users,
  FileSpreadsheet,
  LayoutDashboard,
  Coffee,
  Library,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
}

const mainItems = [
  { id: "pending", label: "Onay Bekleyen", icon: UserCheck, badge: true },
  { id: "courses", label: "Kurslar", icon: BookOpen },
  { id: "videos", label: "Videolar", icon: Video },
  { id: "quizzes", label: "Quizler", icon: HelpCircle },
  { id: "certificates", label: "Sertifikalar", icon: Award },
  { id: "library", label: "E-Kütüphane", icon: Library },
];

const managementItems = [
  { id: "training", label: "Eğitim Takip", icon: ClipboardList },
  { id: "users", label: "Kullanıcılar", icon: Users },
  { id: "import", label: "İçe Aktar", icon: FileSpreadsheet },
];

const settingsItems = [
  { id: "payments", label: "Ödemeler", icon: CreditCard },
  { id: "contact", label: "İletişim", icon: Building },
];

const AdminSidebar = ({ activeTab, onTabChange, pendingCount }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderItem = (item: typeof mainItems[0]) => (
    <SidebarMenuItem key={item.id}>
      <SidebarMenuButton
        onClick={() => onTabChange(item.id)}
        isActive={activeTab === item.id}
        tooltip={item.label}
        className={cn(
          "transition-all duration-200",
          activeTab === item.id && "bg-primary/10 text-primary font-medium"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <span className="flex-1 truncate">{item.label}</span>
        )}
        {!collapsed && "badge" in item && item.badge && pendingCount && pendingCount > 0 ? (
          <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px]">
            {pendingCount}
          </Badge>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Coffee className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Admin Paneli</span>
              <span className="text-[11px] text-muted-foreground">Coffee Academy</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-2">
            İçerik
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-2">
            Yönetim
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-2">
            Ayarlar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
