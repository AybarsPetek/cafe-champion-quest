import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, FileText, FolderOpen, Search } from "lucide-react";
import { useLibraryCategories, useLibraryFiles } from "@/hooks/useLibrary";

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileType: string | null) => {
  return <FileText className="h-8 w-8 text-primary" />;
};

const Library = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data: categories, isLoading: catLoading } = useLibraryCategories();
  const { data: files, isLoading: filesLoading } = useLibraryFiles(selectedCategory);

  const filteredFiles = files?.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">E-Kütüphane</h1>
          <p className="text-muted-foreground mt-1">Dökümanlar, tebliğler ve evraklara buradan ulaşabilirsiniz.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 shrink-0">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Kategoriler
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Button
                  variant={!selectedCategory ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  Tümü
                </Button>
                {categories?.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dosya ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Files */}
            {filesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredFiles && filteredFiles.length > 0 ? (
              <div className="grid gap-3">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="shadow-soft hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="shrink-0">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{file.name}</h3>
                        {file.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{file.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {(file as any).library_categories?.name}
                          </Badge>
                          {file.file_type && (
                            <span className="text-xs text-muted-foreground uppercase">{file.file_type}</span>
                          )}
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(file.created_at).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">İndir</span>
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Bu kategoride dosya bulunmuyor.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
