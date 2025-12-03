import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Image, Trash2, Send } from "lucide-react";
import { useForumCategories, useCreateTopic, useUploadForumImage } from "@/hooks/useForum";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const ForumNewTopic = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    categoryId: searchParams.get("category") || "",
    title: "",
    content: "",
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: categories } = useForumCategories();
  const createTopic = useCreateTopic();
  const uploadImage = useUploadForumImage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadImage.mutateAsync({ userId: user.id, file });
      setImageUrl(url);
    }
  };

  const handleSubmit = () => {
    if (!user || !formData.categoryId || !formData.title.trim() || !formData.content.trim()) return;

    createTopic.mutate(
      {
        categoryId: formData.categoryId,
        userId: user.id,
        title: formData.title,
        content: formData.content,
        imageUrl: imageUrl || undefined,
      },
      {
        onSuccess: (data) => {
          navigate(`/forum/topic/${data.id}`);
        },
      }
    );
  };

  if (!user) {
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

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/forum">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Foruma Dön
          </Link>
        </Button>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Yeni Konu Aç</CardTitle>
            <CardDescription>
              Diğer baristalarla paylaşmak istediğiniz bir konu oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Konu başlığı"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Konunuzu detaylı bir şekilde yazın..."
                rows={8}
              />
            </div>

            {imageUrl && (
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="rounded-lg max-h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl(null)}
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
                onClick={handleSubmit}
                disabled={
                  !formData.categoryId ||
                  !formData.title.trim() ||
                  !formData.content.trim() ||
                  createTopic.isPending
                }
              >
                <Send className="w-4 h-4 mr-2" />
                {createTopic.isPending ? "Oluşturuluyor..." : "Konuyu Oluştur"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForumNewTopic;
