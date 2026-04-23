import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, MessageCircle, Trophy, BookOpen, FileQuestion, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const iconForType = (type: Notification["type"]) => {
  switch (type) {
    case "course_assigned":
      return BookOpen;
    case "badge_earned":
      return Trophy;
    case "forum_reply":
      return MessageCircle;
    case "quiz_result":
      return FileQuestion;
    case "deadline_reminder":
      return AlertCircle;
    default:
      return Bell;
  }
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setUserId(session?.user?.id)
    );
    return () => subscription.unsubscribe();
  }, []);

  const { data: notifications = [] } = useNotifications(userId);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (!userId) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleClick = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Bildirimler${unreadCount > 0 ? ` (${unreadCount} okunmamış)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold">Bildirimler</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => userId && markAllRead.mutate(userId)}
            >
              <CheckCheck className="h-3 w-3" />
              Tümünü okundu işaretle
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Henüz bildirimin yok
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = iconForType(n.type);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={cn(
                        "w-full text-left p-3 hover:bg-muted/50 transition-colors flex gap-3",
                        !n.is_read && "bg-primary/5"
                      )}
                    >
                      <div
                        className={cn(
                          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                          n.is_read ? "bg-muted" : "bg-primary/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            n.is_read ? "text-muted-foreground" : "text-primary"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm", !n.is_read && "font-semibold")}>
                            {n.title}
                          </p>
                          {!n.is_read && (
                            <span className="shrink-0 mt-1 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        {n.message && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
