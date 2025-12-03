import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MessageCircle, Eye, Pin } from "lucide-react";
import { useForumTopics, useForumCategories } from "@/hooks/useForum";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const ForumCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const { data: categories } = useForumCategories();
  const { data: topics, isLoading } = useForumTopics(categoryId);

  const category = categories?.find((c) => c.id === categoryId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  if (isLoading) {
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
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/forum">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Foruma Dön
          </Link>
        </Button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{category?.name || "Kategori"}</h1>
            <p className="text-muted-foreground">{category?.description}</p>
          </div>
          {user && (
            <Button asChild>
              <Link to={`/forum/new?category=${categoryId}`}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Konu Aç
              </Link>
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {topics && topics.length > 0 ? (
            topics.map((topic: any) => (
              <Link key={topic.id} to={`/forum/topic/${topic.id}`}>
                <Card className="shadow-soft hover:shadow-hover transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={topic.profiles?.avatar_url || ""} />
                        <AvatarFallback>
                          {topic.profiles?.full_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.is_pinned && (
                            <Pin className="w-4 h-4 text-primary" />
                          )}
                          <h3 className="font-bold text-lg truncate">
                            {topic.title}
                          </h3>
                          {topic.is_locked && (
                            <Badge variant="secondary">Kilitli</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {topic.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{topic.profiles?.full_name}</span>
                          <span>
                            {formatDistanceToNow(new Date(topic.created_at), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{topic.replies_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{topic.views_count}</span>
                        </div>
                      </div>
                    </div>
                    {topic.image_url && (
                      <div className="mt-4">
                        <img
                          src={topic.image_url}
                          alt="Topic image"
                          className="rounded-lg max-h-48 object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="shadow-soft">
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Bu kategoride henüz konu yok.</p>
                {user && (
                  <Button asChild className="mt-4">
                    <Link to={`/forum/new?category=${categoryId}`}>
                      İlk konuyu sen aç!
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumCategory;
