import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, User, Search, Eye, Mail, CheckCircle, XCircle, Download, KeyRound } from "lucide-react";
import { useAdminUsers, useUpdateUserRole, useUpdateUserProfileAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

const UserManagement = () => {
  const { data: users, isLoading, refetch } = useAdminUsers();
  const updateUserRole = useUpdateUserRole();
  const updateProfile = useUpdateUserProfileAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [emailMap, setEmailMap] = useState<Record<string, { email: string; email_confirmed_at: string | null }>>({});
  const [tempPasswordMap, setTempPasswordMap] = useState<Record<string, string>>({});
  const [emailLoading, setEmailLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    store_name: "",
    employment_date: "",
    bio: "",
    level: "",
    total_points: 0,
    email: "",
    position: "",
  });

  const invokeAdminFunction = async (functionName: string, body: Record<string, any>) => {
    // Force a fresh token check from the server (not cached)
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    
    if (sessionError || !session?.access_token) {
      // Fallback to getSession if refresh fails
      const { data: fallback } = await supabase.auth.getSession();
      if (!fallback.session?.access_token) {
        throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
      }
      return supabase.functions.invoke(functionName, {
        body,
        headers: { Authorization: `Bearer ${fallback.session.access_token}` },
      });
    }

    return supabase.functions.invoke(functionName, {
      body,
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
  };

  // Fetch email data and temp passwords
  useEffect(() => {
    const fetchData = async () => {
      setEmailLoading(true);
      try {
        const emailRequest = invokeAdminFunction("manage-user-emails", { action: "list" });
        const [emailRes, pwRes] = await Promise.all([
          emailRequest,
          supabase.from("user_temp_passwords").select("user_id, temp_password"),
        ]);

        let finalEmailRes = emailRes;
        if (emailRes.error?.message?.toLowerCase().includes("unauthorized")) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          finalEmailRes = await invokeAdminFunction("manage-user-emails", { action: "list" });
        }
        if (finalEmailRes.error) {
          console.error("Email fetch error:", finalEmailRes.error);
          toast({ title: "Uyarı", description: "E-posta bilgileri yüklenemedi. Sayfayı yenileyin.", variant: "destructive" });
        } else if (finalEmailRes.data?.emailMap) {
          setEmailMap(finalEmailRes.data.emailMap);
        } else if (finalEmailRes.data?.error) {
          console.error("Email function error:", finalEmailRes.data.error);
          toast({ title: "Uyarı", description: `E-posta bilgileri alınamadı: ${finalEmailRes.data.error}`, variant: "destructive" });
        }
        if (!pwRes.error && pwRes.data) {
          const pwMap: Record<string, string> = {};
          pwRes.data.forEach((r: any) => { pwMap[r.user_id] = r.temp_password; });
          setTempPasswordMap(pwMap);
        }
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        toast({ title: "Hata", description: "Veriler yüklenirken bir hata oluştu.", variant: "destructive" });
      } finally {
        setEmailLoading(false);
      }
    };
    fetchData();
  }, [users]);

  const filteredUsers = users?.filter((user: any) => {
    const query = searchQuery.toLowerCase();
    const userEmail = emailMap[user.id]?.email || "";
    return (
      (user.full_name || "").toLowerCase().includes(query) ||
      (user.store_name || "").toLowerCase().includes(query) ||
      (user.phone || "").toLowerCase().includes(query) ||
      userEmail.toLowerCase().includes(query)
    );
  });

  const handleExportExcel = () => {
    if (!filteredUsers || filteredUsers.length === 0) return;
    const exportData = filteredUsers.map((user: any) => ({
      "Ad Soyad": user.full_name || "",
      "E-posta": emailMap[user.id]?.email || "",
      "Geçici Şifre": tempPasswordMap[user.id] || "",
      "Telefon": user.phone || "",
      "Görev": user.position || "",
      "Mağaza": user.store_name || "",
      "Seviye": user.level || "Başlangıç",
      "Puan": user.total_points || 0,
      "Durum": user.is_approved ? "Onaylı" : "Onay Bekliyor",
      "Rol": user.role === "admin" ? "Admin" : "Kullanıcı",
      "Kayıt Tarihi": user.created_at ? new Date(user.created_at).toLocaleDateString("tr-TR") : "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kullanıcılar");
    XLSX.writeFile(wb, `kullanicilar-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleResetPasswords = async () => {
    setResetLoading(true);
    try {
      const { data, error } = await invokeAdminFunction("reset-user-passwords", { userIds: [] });
      if (error) throw error;
      toast({
        title: "Başarılı",
        description: `${data.successCount} kullanıcıya geçici şifre atandı.`,
      });
      // Refresh temp password map
      const { data: pwData } = await supabase.from("user_temp_passwords").select("user_id, temp_password");
      if (pwData) {
        const pwMap: Record<string, string> = {};
        pwData.forEach((r: any) => { pwMap[r.user_id] = r.temp_password; });
        setTempPasswordMap(pwMap);
      }
    } catch (err: any) {
      toast({ title: "Hata", description: err.message || "Şifre atama başarısız.", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const handleView = (user: any) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.full_name || "",
      phone: user.phone || "",
      store_name: user.store_name || "",
      employment_date: user.employment_date || "",
      bio: user.bio || "",
      level: user.level || "Başlangıç",
      total_points: user.total_points || 0,
      email: emailMap[user.id]?.email || "",
      position: user.position || "",
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    const { email, ...profileData } = editFormData;
    const currentEmail = emailMap[selectedUser.id]?.email || "";

    // Update profile
    updateProfile.mutate(
      { userId: selectedUser.id, data: profileData },
      {
        onSuccess: async () => {
          // Update email if changed
          if (email && email !== currentEmail) {
            try {
              const { data, error } = await invokeAdminFunction("manage-user-emails", {
                action: "update",
                userId: selectedUser.id,
                newEmail: email,
              });
              if (error) throw error;
              setEmailMap((prev) => ({
                ...prev,
                [selectedUser.id]: { email, email_confirmed_at: new Date().toISOString() },
              }));
              toast({ title: "Başarılı", description: "E-posta adresi güncellendi." });
            } catch (err: any) {
              toast({
                title: "Hata",
                description: err.message || "E-posta güncellenirken bir hata oluştu.",
                variant: "destructive",
              });
            }
          }
          setEditDialogOpen(false);
        },
      }
    );
  };

  const getEmailVerificationBadge = (userId: string) => {
    const info = emailMap[userId];
    if (!info) return null;
    if (info.email_confirmed_at) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
          <CheckCircle className="w-3 h-3" />
          Doğrulanmış
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-500/30 gap-1">
        <XCircle className="w-3 h-3" />
        Doğrulanmamış
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Kullanıcı Yönetimi</CardTitle>
            <CardDescription>Kullanıcı bilgilerini görüntüleyin, düzenleyin ve rollerini yönetin</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="İsim, mağaza, telefon veya e-posta ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleExportExcel} disabled={!filteredUsers || filteredUsers.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleResetPasswords}
              disabled={resetLoading}
              title="Geçici şifresi olmayan kullanıcılara yeni şifre ata"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {resetLoading ? "İşleniyor..." : "Şifre Ata"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || emailLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Mail Onayı</TableHead>
                <TableHead>Görev</TableHead>
                <TableHead>Mağaza</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback className="text-xs">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.full_name || "İsimsiz"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[180px]">{emailMap[user.id]?.email || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getEmailVerificationBadge(user.id)}</TableCell>
                    <TableCell>{user.position || "-"}</TableCell>
                    <TableCell>{user.store_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.level || "Başlangıç"}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_approved ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30">Onaylı</Badge>
                      ) : (
                        <Badge variant="destructive">Onay Bekliyor</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(role: "admin" | "user") =>
                          updateUserRole.mutate({ userId: user.id, role })
                        }
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Kullanıcı</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleView(user)} title="Detay Görüntüle">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)} title="Düzenle">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    {searchQuery ? "Aramanızla eşleşen kullanıcı bulunamadı" : "Henüz kullanıcı bulunmuyor"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayları</DialogTitle>
            <DialogDescription>Kullanıcının tüm bilgileri</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar_url || ""} />
                  <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name || "İsimsiz"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.role === "admin" ? "Admin" : "Kullanıcı"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">E-posta:</span>
                  <p className="font-medium">{emailMap[selectedUser.id]?.email || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mail Onayı:</span>
                  <div className="mt-1">{getEmailVerificationBadge(selectedUser.id)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefon:</span>
                  <p className="font-medium">{selectedUser.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Görev:</span>
                  <p className="font-medium">{selectedUser.position || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mağaza:</span>
                  <p className="font-medium">{selectedUser.store_name || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">İşe Giriş:</span>
                  <p className="font-medium">
                    {selectedUser.employment_date
                      ? new Date(selectedUser.employment_date).toLocaleDateString("tr-TR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kayıt Tarihi:</span>
                  <p className="font-medium">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString("tr-TR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Seviye:</span>
                  <p className="font-medium">{selectedUser.level || "Başlangıç"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Toplam Puan:</span>
                  <p className="font-medium">{selectedUser.total_points || 0}</p>
                </div>
              </div>
              {selectedUser.bio && (
                <div>
                  <span className="text-sm text-muted-foreground">Hakkında:</span>
                  <p className="text-sm mt-1">{selectedUser.bio}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Kapat</Button>
            <Button onClick={() => { setViewDialogOpen(false); handleEdit(selectedUser); }}>Düzenle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı Bilgilerini Düzenle</DialogTitle>
            <DialogDescription>{selectedUser?.full_name || "Kullanıcı"} bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>E-posta Adresi</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="kullanici@ornek.com"
                />
                {selectedUser && getEmailVerificationBadge(selectedUser.id)}
              </div>
              <p className="text-xs text-muted-foreground">E-posta değiştirildiğinde otomatik olarak doğrulanmış kabul edilir.</p>
            </div>
            <div className="grid gap-2">
              <Label>Ad Soyad</Label>
              <Input
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Telefon</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div className="grid gap-2">
                <Label>Görev</Label>
                <Input
                  value={editFormData.position}
                  onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                  placeholder="BARİSTA, İŞLETME MÜDÜRÜ vb."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Mağaza</Label>
                <Input
                  value={editFormData.store_name}
                  onChange={(e) => setEditFormData({ ...editFormData, store_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>İşe Giriş Tarihi</Label>
                <Input
                  type="date"
                  value={editFormData.employment_date}
                  onChange={(e) => setEditFormData({ ...editFormData, employment_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>İşe Giriş Tarihi</Label>
                <Input
                  type="date"
                  value={editFormData.employment_date}
                  onChange={(e) => setEditFormData({ ...editFormData, employment_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Seviye</Label>
                <Select
                  value={editFormData.level}
                  onValueChange={(value) => setEditFormData({ ...editFormData, level: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                    <SelectItem value="Orta">Orta</SelectItem>
                    <SelectItem value="İleri">İleri</SelectItem>
                    <SelectItem value="Uzman">Uzman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Toplam Puan</Label>
              <Input
                type="number"
                value={editFormData.total_points}
                onChange={(e) => setEditFormData({ ...editFormData, total_points: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hakkında</Label>
              <Textarea
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
