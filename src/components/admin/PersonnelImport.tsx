import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, RefreshCw, AlertTriangle, UserPlus, UserCheck, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";

interface ParsedPerson {
  full_name: string;
  phone: string;
  store_name: string;
  position: string;
  status: string;
}

interface PreviewResult extends ParsedPerson {
  normalizedPhone: string;
  existingUserId: string | null;
  existingName: string | null;
  existingEmail: string | null;
  matchStatus: "update" | "new";
}

interface ImportResult {
  name: string;
  phone: string;
  store_name?: string;
  status: "created" | "updated" | "error";
  message: string;
  email?: string;
  passwordLink?: string;
}

const PersonnelImport = () => {
  const [parsedData, setParsedData] = useState<ParsedPerson[]>([]);
  const [previewResults, setPreviewResults] = useState<PreviewResult[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Find header row
      let headerIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const row = rows[i];
        if (row && row.some((cell: any) => String(cell).includes("Personel Adı"))) {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx === -1) {
        toast({ title: "Hata", description: "Excel dosyasında 'Personel Adı' başlığı bulunamadı.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const headers = rows[headerIdx].map((h: any) => String(h).trim());
      const nameIdx = headers.findIndex((h: string) => h.includes("Personel Adı"));
      const phoneIdx = headers.findIndex((h: string) => h.includes("Personel Telefon"));
      const positionIdx = headers.findIndex((h: string) => h.includes("Personel Görev") || h.includes("Görev"));
      const storeIdx = headers.findIndex((h: string) => h.includes("Şube"));
      const statusIdx = headers.findIndex((h: string) => h === "Durum");

      const personnel: ParsedPerson[] = [];
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[nameIdx]) continue;

        const rowStatus = statusIdx >= 0 ? String(row[statusIdx] || "").trim() : "Aktif";
        if (rowStatus && rowStatus.toLowerCase() !== "aktif") continue; // Only import active personnel

        personnel.push({
          full_name: String(row[nameIdx] || "").trim(),
          phone: String(row[phoneIdx] || "").trim(),
          store_name: storeIdx >= 0 ? String(row[storeIdx] || "").trim() : "",
          position: positionIdx >= 0 ? String(row[positionIdx] || "").trim() : "",
          status: rowStatus,
        });
      }

      setParsedData(personnel);

      // Preview - match with existing users
      const { data: previewData, error } = await supabase.functions.invoke("import-personnel", {
        body: { action: "preview", personnel },
      });

      if (error) throw error;

      setPreviewResults(
        previewData.results.map((r: any) => ({
          ...r,
          matchStatus: r.status,
        }))
      );
      setStep("preview");
    } catch (err: any) {
      toast({ title: "Hata", description: err.message || "Dosya okunurken bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setStep("importing");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("import-personnel", {
        body: {
          action: "import",
          personnel: parsedData,
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setImportResults(data.results);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });

      const created = data.results.filter((r: any) => r.status === "created").length;
      const updated = data.results.filter((r: any) => r.status === "updated").length;
      const errors = data.results.filter((r: any) => r.status === "error").length;

      toast({
        title: "İçe Aktarma Tamamlandı",
        description: `${created} yeni, ${updated} güncellendi${errors > 0 ? `, ${errors} hata` : ""}`,
      });
    } catch (err: any) {
      toast({ title: "Hata", description: err.message || "İçe aktarma sırasında bir hata oluştu.", variant: "destructive" });
      setStep("preview");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setParsedData([]);
    setPreviewResults([]);
    setImportResults([]);
    setStep("upload");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportResults = () => {
    const exportData = importResults.map((r) => ({
      "Personel Adı": r.name,
      "Telefon": r.phone,
      "Mağaza": r.store_name || "",
      "E-posta": r.email || "-",
      "Şifre Oluşturma Linki": r.passwordLink || "-",
      "Sonuç": r.status === "created" ? "Oluşturuldu" : r.status === "updated" ? "Güncellendi" : "Hata",
      "Detay": r.message,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "İçe Aktarma Sonuçları");
    XLSX.writeFile(wb, `import-sonuc-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const newCount = previewResults.filter((r) => r.matchStatus === "new").length;
  const updateCount = previewResults.filter((r) => r.matchStatus === "update").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Personel İçe Aktarma
        </CardTitle>
        <CardDescription>
          Excel dosyasından personel listesini içe aktarın. Mevcut kullanıcılar telefon numarasına göre eşleştirilir ve güncellenir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Step */}
        {step === "upload" && (
          <div className="flex flex-col items-center gap-4 py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Excel dosyası yükleyin</p>
              <p className="text-sm text-muted-foreground">
                .xlsx veya .xls formatında personel listesi
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Okunuyor...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Dosya Seç
                </>
              )}
            </Button>
          </div>
        )}

        {/* Preview Step */}
        {step === "preview" && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {parsedData.length} aktif personel bulundu
                </p>
                <div className="flex gap-3 mt-2">
                  <Badge variant="outline" className="gap-1">
                    <UserPlus className="w-3 h-3" />
                    {newCount} yeni
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <UserCheck className="w-3 h-3" />
                    {updateCount} güncelleme
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>
                  Farklı Dosya
                </Button>
                <Button onClick={handleImport} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  İçe Aktar ({parsedData.length} kişi)
                </Button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personel Adı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Şube</TableHead>
                    <TableHead>Görev</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewResults.map((person, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{person.full_name}</TableCell>
                      <TableCell>{person.phone}</TableCell>
                      <TableCell>{person.store_name}</TableCell>
                      <TableCell>{person.position}</TableCell>
                      <TableCell>
                        {person.matchStatus === "update" ? (
                          <Badge variant="secondary" className="gap-1">
                            <UserCheck className="w-3 h-3" />
                            Güncelleme
                          </Badge>
                        ) : (
                          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                            <UserPlus className="w-3 h-3" />
                            Yeni
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Importing Step */}
        {step === "importing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <RefreshCw className="w-12 h-12 text-primary animate-spin" />
            <p className="font-medium">İçe aktarılıyor...</p>
            <p className="text-sm text-muted-foreground">
              {parsedData.length} personel işleniyor, lütfen bekleyin.
            </p>
          </div>
        )}

        {/* Done Step */}
        {step === "done" && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  İçe aktarma tamamlandı
                </p>
                <div className="flex gap-3 mt-2">
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
                    <UserPlus className="w-3 h-3" />
                    {importResults.filter((r) => r.status === "created").length} oluşturuldu
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <UserCheck className="w-3 h-3" />
                    {importResults.filter((r) => r.status === "updated").length} güncellendi
                  </Badge>
                  {importResults.filter((r) => r.status === "error").length > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="w-3 h-3" />
                      {importResults.filter((r) => r.status === "error").length} hata
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportResults}>
                  <Download className="w-4 h-4 mr-2" />
                  Excel İndir
                </Button>
                <Button onClick={reset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Yeni İçe Aktarma
                </Button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personel Adı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Şifre Linki</TableHead>
                    <TableHead>Sonuç</TableHead>
                    <TableHead>Detay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResults.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{result.name}</TableCell>
                      <TableCell>{result.phone}</TableCell>
                      <TableCell className="text-sm">{result.email || "-"}</TableCell>
                      <TableCell className="text-xs font-mono max-w-[220px] truncate">
                        {result.passwordLink ? (
                          <a
                            href={result.passwordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            title={result.passwordLink}
                          >
                            Linki aç
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {result.status === "created" && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Oluşturuldu
                          </Badge>
                        )}
                        {result.status === "updated" && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Güncellendi
                          </Badge>
                        )}
                        {result.status === "error" && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Hata
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                        {result.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonnelImport;
