import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil, Upload, FolderOpen, FileText, Download } from "lucide-react";
import {
  useLibraryCategories,
  useLibraryFiles,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUploadLibraryFile,
  useDeleteLibraryFile,
} from "@/hooks/useLibrary";

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const LibraryManagement = () => {
  const { data: categories } = useLibraryCategories();
  const { data: files } = useLibraryFiles();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const uploadFile = useUploadLibraryFile();
  const deleteFile = useDeleteLibraryFile();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category form
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: "", description: "", order_index: 0 });

  // File form
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileForm, setFileForm] = useState({ category_id: "", name: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetCatForm = () => {
    setEditingCat(null);
    setCatForm({ name: "", description: "", order_index: 0 });
  };

  const openEditCat = (cat: any) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description || "", order_index: cat.order_index });
    setCatDialogOpen(true);
  };

  const handleCatSubmit = () => {
    if (editingCat) {
      updateCategory.mutate({ id: editingCat.id, ...catForm });
    } else {
      createCategory.mutate(catForm);
    }
    setCatDialogOpen(false);
    resetCatForm();
  };

  const handleFileSubmit = async () => {
    if (!selectedFile || !fileForm.category_id || !fileForm.name) return;
    await uploadFile.mutateAsync({
      file: selectedFile,
      categoryId: fileForm.category_id,
      name: fileForm.name,
      description: fileForm.description,
    });
    setFileDialogOpen(false);
    setSelectedFile(null);
    setFileForm({ category_id: "", name: "", description: "" });
  };

  return (
    <Tabs defaultValue="files" className="space-y-4">
      <TabsList>
        <TabsTrigger value="files">
          <FileText className="w-4 h-4 mr-2" />
          Dosyalar
        </TabsTrigger>
        <TabsTrigger value="categories">
          <FolderOpen className="w-4 h-4 mr-2" />
          Kategoriler
        </TabsTrigger>
      </TabsList>

      {/* FILES TAB */}
      <TabsContent value="files" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setSelectedFile(null); setFileForm({ category_id: "", name: "", description: "" }); }}>
                <Upload className="w-4 h-4 mr-2" />
                Dosya Yükle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Dosya Yükle</DialogTitle>
                <DialogDescription>Kütüphaneye yeni bir dosya ekleyin</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select value={fileForm.category_id} onValueChange={(v) => setFileForm({ ...fileForm, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Dosya Adı</Label>
                  <Input value={fileForm.name} onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })} placeholder="Örn: Barista El Kitabı" />
                </div>
                <div className="grid gap-2">
                  <Label>Açıklama (İsteğe bağlı)</Label>
                  <Textarea value={fileForm.description} onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })} rows={2} />
                </div>
                <div className="grid gap-2">
                  <Label>Dosya</Label>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      if (!fileForm.name) setFileForm(prev => ({ ...prev, name: f.name.replace(/\.[^/.]+$/, '') }));
                    }
                  }} />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? selectedFile.name : "Dosya Seç"}
                  </Button>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFileDialogOpen(false)}>İptal</Button>
                <Button onClick={handleFileSubmit} disabled={!selectedFile || !fileForm.category_id || !fileForm.name || uploadFile.isPending}>
                  {uploadFile.isPending ? "Yükleniyor..." : "Yükle"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dosya Adı</TableHead>
                <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                <TableHead className="hidden md:table-cell">Boyut</TableHead>
                <TableHead className="hidden md:table-cell">Tür</TableHead>
                <TableHead className="hidden sm:table-cell">Tarih</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files && files.length > 0 ? (
                files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{file.name}</span>
                        {file.description && <p className="text-xs text-muted-foreground mt-0.5">{file.description}</p>}
                        <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                          {(file as any).library_categories?.name} · {formatFileSize(file.file_size)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{(file as any).library_categories?.name || "-"}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatFileSize(file.file_size)}</TableCell>
                    <TableCell className="hidden md:table-cell uppercase">{file.file_type || "-"}</TableCell>
                    <TableCell className="hidden sm:table-cell">{new Date(file.created_at).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild>
                          <a href={file.file_url} target="_blank" rel="noopener noreferrer" download>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteFile.mutate({ id: file.id, fileUrl: file.file_url })} disabled={deleteFile.isPending}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">Henüz dosya yüklenmemiş</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* CATEGORIES TAB */}
      <TabsContent value="categories" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetCatForm}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kategori
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCat ? "Kategori Düzenle" : "Yeni Kategori"}</DialogTitle>
                <DialogDescription>Kütüphane kategorisi bilgilerini doldurun</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Kategori Adı</Label>
                  <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Örn: Tebliğler" />
                </div>
                <div className="grid gap-2">
                  <Label>Açıklama</Label>
                  <Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={2} />
                </div>
                <div className="grid gap-2">
                  <Label>Sıra</Label>
                  <Input type="number" value={catForm.order_index} onChange={(e) => setCatForm({ ...catForm, order_index: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCatDialogOpen(false)}>İptal</Button>
                <Button onClick={handleCatSubmit}>Kaydet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori Adı</TableHead>
              <TableHead className="hidden sm:table-cell">Açıklama</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{cat.description || "-"}</TableCell>
                  <TableCell>{cat.order_index}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditCat(cat)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCategory.mutate(cat.id)} disabled={deleteCategory.isPending}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">Henüz kategori eklenmemiş</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
};

export default LibraryManagement;
