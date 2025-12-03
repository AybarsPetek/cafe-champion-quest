import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, User } from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    store_name: "",
    employment_date: "",
    bio: "",
    phone: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: profile, isLoading } = useProfile(user?.id || "");
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        store_name: profile.store_name || "",
        employment_date: profile.employment_date || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!user) return;
    updateProfile.mutate({
      userId: user.id,
      data: formData,
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      uploadAvatar.mutate({ userId: user.id, file });
    }
  };

  if (!user || isLoading) {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profil Ayarları</h1>
          <p className="text-muted-foreground">Kişisel bilgilerinizi düzenleyin</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Profil Fotoğrafı</CardTitle>
              <CardDescription>Fotoğrafınızı güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-4xl bg-primary/10">
                    <User className="w-12 h-12 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Fotoğrafınızı değiştirmek için tıklayın
              </p>
              {uploadAvatar.isPending && (
                <p className="text-sm text-primary mt-2">Yükleniyor...</p>
              )}
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>Bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Ad Soyad</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Çalıştığınız Mağaza</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name}
                    onChange={(e) =>
                      setFormData({ ...formData, store_name: e.target.value })
                    }
                    placeholder="Mağaza adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment_date">İşe Giriş Tarihi</Label>
                  <Input
                    id="employment_date"
                    type="date"
                    value={formData.employment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, employment_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Hakkımda</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Kendinizden bahsedin..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updateProfile.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
