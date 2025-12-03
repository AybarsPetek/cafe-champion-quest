import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Coffee, Settings, ChefHat, Briefcase, Users, Plus } from "lucide-react";
import { useForumCategories, useForumTopics } from "@/hooks/useForum";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const iconMap: Record<string, any> = {
  "message-circle": MessageCircle,
  coffee: Coffee,
  settings: Settings,
  "chef-hat": ChefHat,
  briefcase: Briefcase,
  users: Users,
};

const Forum = () => {
  const [user, setUser] = useState<User | null>(null);
  const { data: categories, isLoading: categoriesLoading } = useForumCategories();
  const { data: recentTopics, isLoading: topicsLoading } = useForumTopics();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  if (categoriesLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Barista Forumu</h1>
            <p className="text-muted-foreground">
              Diğer baristalarla sohbet edin, sorular sorun ve deneyimlerinizi paylaşın
            </p>
          </div>
          {user && (
            <Button asChild>
              <Link to="/forum/new">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Konu Aç
              </Link>
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Kategoriler</h2>
            {categories?.map((category) => {
              const Icon = iconMap[category.icon] || MessageCircle;
              return (
                <Link key={category.id} to={`/forum/category/${category.id}`}>
                  <Card className="shadow-soft hover:shadow-hover transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {category.topics_count} konu
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Recent Topics */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Son Konular</h2>
            <Card className="shadow-soft">
              <CardContent className="p-4 space-y-4">
                {topicsLoading ? (
                  <p className="text-muted-foreground text-center py-4">Yükleniyor...</p>
                ) : recentTopics && recentTopics.length > 0 ? (
                  recentTopics.slice(0, 5).map((topic: any) => (
                    <Link
                      key={topic.id}
                      to={`/forum/topic/${topic.id}`}
                      className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={topic.profiles?.avatar_url || ""} />
                          <AvatarFallback className="text-xs">
                            {topic.profiles?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{topic.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {topic.profiles?.full_name} •{" "}
                            {formatDistanceToNow(new Date(topic.created_at), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {topic.replies_count} yanıt
                        </Badge>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Henüz konu yok
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
