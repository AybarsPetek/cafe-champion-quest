import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Instagram } from "lucide-react";
import {
  useAllInstagramPosts,
  useCreateInstagramPost,
  useUpdateInstagramPost,
  useDeleteInstagramPost,
  InstagramPost,
} from "@/hooks/useInstagramPosts";

const InstagramManagement = () => {
  const { data: posts, isLoading } = useAllInstagramPosts();
  const createMutation = useCreateInstagramPost();
  const updateMutation = useUpdateInstagramPost();
  const deleteMutation = useDeleteInstagramPost();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [formData, setFormData] = useState({
    post_url: "",
    description: "",
    order_index: 0,
  });

  const resetForm = () => {
    setFormData({ post_url: "", description: "", order_index: 0 });
    setEditingPost(null);
  };

  const handleOpenDialog = (post?: InstagramPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        post_url: post.post_url,
        description: post.description || "",
        order_index: post.order_index,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      await updateMutation.mutateAsync({
        id: editingPost.id,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleToggleActive = async (post: InstagramPost) => {
    await updateMutation.mutateAsync({
      id: post.id,
      is_active: !post.is_active,
    });
  };

  if (isLoading) return <p className="text-muted-foreground">Yükleniyor...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Instagram className="h-6 w-6" />
            Instagram Postları
          </h2>
          <p className="text-muted-foreground">
            Ana sayfada gösterilecek Instagram postlarını yönetin
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Post Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Post Düzenle" : "Yeni Instagram Postu"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Instagram Post URL'si</Label>
                <Input
                  value={formData.post_url}
                  onChange={(e) =>
                    setFormData({ ...formData, post_url: e.target.value })
                  }
                  placeholder="https://www.instagram.com/p/XXXX/"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Instagram post veya reel linkini yapıştırın
                </p>
              </div>
              <div>
                <Label>Açıklama (opsiyonel)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Post açıklaması"
                />
              </div>
              <div>
                <Label>Sıralama</Label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order_index: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPost ? "Güncelle" : "Ekle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!posts?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Instagram className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Henüz Instagram postu eklenmemiş</p>
            <p className="text-sm">
              Yukarıdaki "Post Ekle" butonuyla Instagram postlarınızı ekleyin
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className={!post.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium truncate max-w-md">
                    {post.post_url}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={post.is_active}
                      onCheckedChange={() => handleToggleActive(post)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(post)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(post.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {post.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {post.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstagramManagement;
