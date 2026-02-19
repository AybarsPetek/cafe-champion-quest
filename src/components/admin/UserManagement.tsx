import { useState } from "react";
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
import { Pencil, User, Search, Eye } from "lucide-react";
import { useAdminUsers, useUpdateUserRole } from "@/hooks/useAdmin";
import { useUpdateUserProfileAdmin } from "@/hooks/useAdmin";

const UserManagement = () => {
  const { data: users, isLoading } = useAdminUsers();
  const updateUserRole = useUpdateUserRole();
  const updateProfile = useUpdateUserProfileAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    store_name: "",
    employment_date: "",
    bio: "",
    level: "",
    total_points: 0,
  });

  const filteredUsers = users?.filter((user: any) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.full_name || "").toLowerCase().includes(query) ||
      (user.store_name || "").toLowerCase().includes(query) ||
      (user.phone || "").toLowerCase().includes(query)
    );
  });

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
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedUser) return;
    updateProfile.mutate(
      { userId: selectedUser.id, data: editFormData },
      { onSuccess: () => setEditDialogOpen(false) }
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
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="İsim, mağaza veya telefon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Mağaza</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Puan</TableHead>
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
                    <TableCell>{user.store_name || "-"}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.level || "Başlangıç"}</Badge>
                    </TableCell>
                    <TableCell>{user.total_points || 0}</TableCell>
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
                        onValueChange={(role: 'admin' | 'user') =>
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
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
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
                  <span className="text-muted-foreground">Telefon:</span>
                  <p className="font-medium">{selectedUser.phone || "-"}</p>
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
                <Label>Mağaza</Label>
                <Input
                  value={editFormData.store_name}
                  onChange={(e) => setEditFormData({ ...editFormData, store_name: e.target.value })}
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
