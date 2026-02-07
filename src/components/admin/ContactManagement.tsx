import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Building, Globe } from "lucide-react";
import {
  useAllContactSettings,
  useCreateContactSettings,
  useUpdateContactSettings,
  useDeleteContactSettings,
  ContactSettings,
} from "@/hooks/useContactSettings";

const ContactManagement = () => {
  const { data: contactSettings, isLoading } = useAllContactSettings();
  const createMutation = useCreateContactSettings();
  const updateMutation = useUpdateContactSettings();
  const deleteMutation = useDeleteContactSettings();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<ContactSettings | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    phone: "",
    address: "",
    working_hours: "",
    google_maps_url: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
    additional_info: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      company_name: "",
      email: "",
      phone: "",
      address: "",
      working_hours: "",
      google_maps_url: "",
      facebook_url: "",
      instagram_url: "",
      twitter_url: "",
      linkedin_url: "",
      additional_info: "",
      is_active: true,
    });
    setEditingSettings(null);
  };

  const handleEdit = (settings: ContactSettings) => {
    setEditingSettings(settings);
    setFormData({
      company_name: settings.company_name,
      email: settings.email || "",
      phone: settings.phone || "",
      address: settings.address || "",
      working_hours: settings.working_hours || "",
      google_maps_url: settings.google_maps_url || "",
      facebook_url: settings.facebook_url || "",
      instagram_url: settings.instagram_url || "",
      twitter_url: settings.twitter_url || "",
      linkedin_url: settings.linkedin_url || "",
      additional_info: settings.additional_info || "",
      is_active: settings.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSettings) {
      await updateMutation.mutateAsync({
        id: editingSettings.id,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu iletişim bilgilerini silmek istediğinize emin misiniz?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">İletişim Bilgileri Yönetimi</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              İletişim Bilgisi Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSettings ? "İletişim Bilgilerini Düzenle" : "Yeni İletişim Bilgisi"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Şirket Adı *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Coffee Academy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 555 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working_hours">Çalışma Saatleri</Label>
                  <Input
                    id="working_hours"
                    value={formData.working_hours}
                    onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                    placeholder="Pzt-Cum: 09:00-18:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Şirket adresi..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_maps_url">Google Maps Linki</Label>
                <Input
                  id="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Sosyal Medya Linkleri
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">Facebook</Label>
                    <Input
                      id="facebook_url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram</Label>
                    <Input
                      id="instagram_url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_url">Twitter</Label>
                    <Input
                      id="twitter_url"
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn</Label>
                    <Input
                      id="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_info">Ek Bilgiler</Label>
                <Textarea
                  id="additional_info"
                  value={formData.additional_info}
                  onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                  placeholder="Vergi no, ticaret sicil no vb. ek bilgiler..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktif (Sitede gösterilsin)</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingSettings ? "Güncelle" : "Ekle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {contactSettings && contactSettings.length > 0 ? (
        <div className="grid gap-4">
          {contactSettings.map((settings) => (
            <Card key={settings.id} className={!settings.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {settings.company_name}
                    {!settings.is_active && (
                      <span className="text-sm font-normal text-muted-foreground">(Pasif)</span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(settings)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(settings.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {settings.email && (
                    <div>
                      <span className="text-muted-foreground">E-posta:</span>{" "}
                      <span>{settings.email}</span>
                    </div>
                  )}
                  {settings.phone && (
                    <div>
                      <span className="text-muted-foreground">Telefon:</span>{" "}
                      <span>{settings.phone}</span>
                    </div>
                  )}
                  {settings.working_hours && (
                    <div>
                      <span className="text-muted-foreground">Çalışma Saatleri:</span>{" "}
                      <span>{settings.working_hours}</span>
                    </div>
                  )}
                  {settings.address && (
                    <div className="md:col-span-3">
                      <span className="text-muted-foreground">Adres:</span>{" "}
                      <span>{settings.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Henüz iletişim bilgisi eklenmemiş.</p>
            <p className="text-sm text-muted-foreground">
              Yukarıdaki butona tıklayarak iletişim bilgisi ekleyin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactManagement;
