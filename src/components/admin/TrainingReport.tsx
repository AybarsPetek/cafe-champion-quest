import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, AlertTriangle, CheckCircle, Clock, Users, BookOpen, TrendingUp } from "lucide-react";
import { useTrainingAssignments } from "@/hooks/useTrainingManagement";

const TrainingReport = () => {
  const { data: assignments, isLoading } = useTrainingAssignments();

  const now = new Date();

  // Per-user summary
  const userSummary = new Map<string, {
    name: string;
    total: number;
    completed: number;
    overdue: number;
    avgProgress: number;
  }>();

  // Per-course summary
  const courseSummary = new Map<string, {
    title: string;
    total: number;
    completed: number;
    overdue: number;
    avgProgress: number;
  }>();

  assignments?.forEach((a: any) => {
    const userId = a.user_id;
    const courseId = a.course_id;
    const isOverdue = !a.completed && a.deadline && new Date(a.deadline) < now;

    // User summary
    if (!userSummary.has(userId)) {
      userSummary.set(userId, { name: a.profile?.full_name || "İsimsiz", total: 0, completed: 0, overdue: 0, avgProgress: 0 });
    }
    const u = userSummary.get(userId)!;
    u.total++;
    if (a.completed) u.completed++;
    if (isOverdue) u.overdue++;
    u.avgProgress += a.progressPercentage || 0;

    // Course summary
    if (!courseSummary.has(courseId)) {
      courseSummary.set(courseId, { title: a.course?.title || "Bilinmiyor", total: 0, completed: 0, overdue: 0, avgProgress: 0 });
    }
    const c = courseSummary.get(courseId)!;
    c.total++;
    if (a.completed) c.completed++;
    if (isOverdue) c.overdue++;
    c.avgProgress += a.progressPercentage || 0;
  });

  // Finalize averages
  userSummary.forEach(u => { if (u.total > 0) u.avgProgress = Math.round(u.avgProgress / u.total); });
  courseSummary.forEach(c => { if (c.total > 0) c.avgProgress = Math.round(c.avgProgress / c.total); });

  const userRows = Array.from(userSummary.entries()).sort((a, b) => b[1].total - a[1].total);
  const courseRows = Array.from(courseSummary.entries()).sort((a, b) => b[1].total - a[1].total);

  const totalAssignments = assignments?.length || 0;
  const totalCompleted = assignments?.filter((a: any) => a.completed).length || 0;
  const totalOverdue = assignments?.filter((a: any) => !a.completed && a.deadline && new Date(a.deadline) < now).length || 0;
  const completionRate = totalAssignments > 0 ? Math.round((totalCompleted / totalAssignments) * 100) : 0;

  const exportCSV = () => {
    if (!assignments || assignments.length === 0) return;

    const headers = ["Personel", "Eğitim", "İlerleme (%)", "Durum", "Son Tarih", "Atanma Tarihi", "Tamamlanma Tarihi"];
    const rows = assignments.map((a: any) => {
      let status = "Başlanmadı";
      if (a.completed) status = "Tamamlandı";
      else if (a.deadline && new Date(a.deadline) < now) status = "Süresi Geçti";
      else if (a.progressPercentage > 0) status = "Devam Ediyor";

      return [
        a.profile?.full_name || "İsimsiz",
        a.course?.title || "Bilinmiyor",
        a.progressPercentage || 0,
        status,
        a.deadline ? new Date(a.deadline).toLocaleDateString("tr-TR") : "-",
        new Date(a.assigned_at).toLocaleDateString("tr-TR"),
        a.completed_at ? new Date(a.completed_at).toLocaleDateString("tr-TR") : "-",
      ];
    });

    const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `egitim-raporu-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Genel Özet</h3>
        <Button onClick={exportCSV} disabled={!assignments || assignments.length === 0}>
          <Download className="w-4 h-4 mr-2" /> CSV İndir
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">{userSummary.size}</p>
            <p className="text-sm text-muted-foreground">Toplam Personel</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">%{completionRate}</p>
            <p className="text-sm text-muted-foreground">Tamamlanma Oranı</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
            <p className="text-sm text-muted-foreground">Tamamlanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{totalOverdue}</p>
            <p className="text-sm text-muted-foreground">Süresi Geçen</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-User Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Personel Bazlı Rapor
          </CardTitle>
          <CardDescription>Her personelin eğitim ilerleme durumu</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Personel</TableHead>
                <TableHead>Atanan</TableHead>
                <TableHead>Tamamlanan</TableHead>
                <TableHead>Geciken</TableHead>
                <TableHead>Ort. İlerleme</TableHead>
                <TableHead>Başarı Oranı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRows.length > 0 ? userRows.map(([id, u]) => (
                <TableRow key={id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.total}</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">{u.completed}</span>
                  </TableCell>
                  <TableCell>
                    {u.overdue > 0 ? (
                      <Badge variant="destructive">{u.overdue}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={u.avgProgress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground">%{u.avgProgress}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.total > 0 && u.completed === u.total ? "default" : "secondary"}>
                      %{u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Veri bulunamadı</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Per-Course Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Eğitim Bazlı Rapor
          </CardTitle>
          <CardDescription>Her eğitimin tamamlanma durumu</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Eğitim</TableHead>
                <TableHead>Atanan Kişi</TableHead>
                <TableHead>Tamamlayan</TableHead>
                <TableHead>Geciken</TableHead>
                <TableHead>Ort. İlerleme</TableHead>
                <TableHead>Tamamlanma Oranı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseRows.length > 0 ? courseRows.map(([id, c]) => (
                <TableRow key={id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.total}</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">{c.completed}</span>
                  </TableCell>
                  <TableCell>
                    {c.overdue > 0 ? (
                      <Badge variant="destructive">{c.overdue}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={c.avgProgress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground">%{c.avgProgress}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.total > 0 && c.completed === c.total ? "default" : "secondary"}>
                      %{c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Veri bulunamadı</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingReport;
