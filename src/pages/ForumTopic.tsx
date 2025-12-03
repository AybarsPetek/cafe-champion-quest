import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Image, Trash2 } from "lucide-react";
import {
  useForumTopic,
  useForumReplies,
  useCreateReply,
  useUploadForumImage,
  useDeleteTopic,
  useDeleteReply,
} from "@/hooks/useForum";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const ForumTopic = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: topic, isLoading: topicLoading } = useForumTopic(topicId || "");
  const { data: replies, isLoading: repliesLoading } = useForumReplies(topicId || "");
  const createReply = useCreateReply();
  const uploadImage = useUploadForumImage();
  const deleteTopic = useDeleteTopic();
  const deleteReply = useDeleteReply();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleSubmitReply = async () => {
    if (!user || !topicId || !replyContent.trim()) return;

    createReply.mutate({
      topicId,
      userId: user.id,
      content: replyContent,
      imageUrl: replyImage || undefined,
    });

    setReplyContent("");
    setReplyImage(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadImage.mutateAsync({ userId: user.id, file });
      setReplyImage(url);
    }
  };

  const handleDeleteTopic = () => {
    if (!topicId) return;
    if (confirm("Bu konuyu silmek istediğinizden emin misiniz?")) {
      deleteTopic.mutate(topicId, {
        onSuccess: () => navigate("/forum"),
      });
    }
  };

  const handleDeleteReply = (replyId: string) => {
    if (!topicId) return;
    if (confirm("Bu yanıtı silmek istediğinizden emin misiniz?")) {
      deleteReply.mutate({ replyId, topicId });
    }
  };

  if (topicLoading || !topic) {
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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/forum/category/${topic.forum_categories?.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {topic.forum_categories?.name || "Foruma Dön"}
          </Link>
        </Button>

        {/* Topic */}
        <Card className="shadow-soft mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={topic.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  {topic.profiles?.full_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{topic.title}</h1>
                    <p className="text-sm text-muted-foreground">
                      {topic.profiles?.full_name} •{" "}
                      {formatDistanceToNow(new Date(topic.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>
                  </div>
                  {user?.id === topic.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteTopic}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-4 prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{topic.content}</p>
                </div>
                {topic.image_url && (
                  <div className="mt-4">
                    <img
                      src={topic.image_url}
                      alt="Topic image"
                      className="rounded-lg max-w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <h2 className="text-xl font-bold mb-4">
          Yanıtlar ({replies?.length || 0})
        </h2>

        <div className="space-y-4 mb-6">
          {repliesLoading ? (
            <p className="text-muted-foreground">Yükleniyor...</p>
          ) : replies && replies.length > 0 ? (
            replies.map((reply: any) => (
              <Card key={reply.id} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={reply.profiles?.avatar_url || ""} />
                      <AvatarFallback>
                        {reply.profiles?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {reply.profiles?.full_name}
                          </span>{" "}
                          •{" "}
                          {formatDistanceToNow(new Date(reply.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                        {user?.id === reply.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReply(reply.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap">{reply.content}</p>
                      {reply.image_url && (
                        <div className="mt-4">
                          <img
                            src={reply.image_url}
                            alt="Reply image"
                            className="rounded-lg max-w-full max-h-64 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Henüz yanıt yok. İlk yanıtı sen yaz!
            </p>
          )}
        </div>

        {/* Reply Form */}
        {user && !topic.is_locked && (
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Yanıt Yaz</h3>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Yanıtınızı yazın..."
                rows={4}
                className="mb-4"
              />
              {replyImage && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={replyImage}
                    alt="Preview"
                    className="rounded-lg max-h-32 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setReplyImage(null)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex justify-between items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImage.isPending}
                >
                  <Image className="w-4 h-4 mr-2" />
                  {uploadImage.isPending ? "Yükleniyor..." : "Resim Ekle"}
                </Button>
                <Button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || createReply.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createReply.isPending ? "Gönderiliyor..." : "Yanıtla"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Yanıt yazmak için giriş yapmalısınız.
              </p>
              <Button asChild>
                <Link to="/auth">Giriş Yap</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ForumTopic;
