import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, AlertTriangle, CheckCircle, Clock, Users, BookOpen, TrendingUp } from "lucide-react";
import { useTrainingAssignments } from "@/hooks/useTrainingManagement";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(142 76% 36%)", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

const TrainingReport = () => {
  const { data: assignments, isLoading } = useTrainingAssignments();

  const now = new Date();

  // Per-user summary
  const userSummary = new Map<string, {
    name: string;
    total: number;
    completed: number;
    overdue: number;
    inProgress: number;
    notStarted: number;
    avgProgress: number;
  }>();

  // Per-course summary
  const courseSummary = new Map<string, {
    title: string;
    total: number;
    completed: number;
    overdue: number;
    inProgress: number;
    notStarted: number;
    avgProgress: number;
  }>();

  assignments?.forEach((a: any) => {
    const userId = a.user_id;
    const courseId = a.course_id;
    const isOverdue = !a.completed && a.deadline && new Date(a.deadline) < now;
    const isInProgress = !a.completed && !isOverdue && (a.progressPercentage || 0) > 0;
    const isNotStarted = !a.completed && !isOverdue && (a.progressPercentage || 0) === 0;

    // User summary
    if (!userSummary.has(userId)) {
      userSummary.set(userId, { name: a.profile?.full_name || "İsimsiz", total: 0, completed: 0, overdue: 0, inProgress: 0, notStarted: 0, avgProgress: 0 });
    }
    const u = userSummary.get(userId)!;
    u.total++;
    if (a.completed) u.completed++;
    if (isOverdue) u.overdue++;
    if (isInProgress) u.inProgress++;
    if (isNotStarted) u.notStarted++;
    u.avgProgress += a.progressPercentage || 0;

    // Course summary
    if (!courseSummary.has(courseId)) {
      courseSummary.set(courseId, { title: a.course?.title || "Bilinmiyor", total: 0, completed: 0, overdue: 0, inProgress: 0, notStarted: 0, avgProgress: 0 });
    }
    const c = courseSummary.get(courseId)!;
    c.total++;
    if (a.completed) c.completed++;
    if (isOverdue) c.overdue++;
    if (isInProgress) c.inProgress++;
    if (isNotStarted) c.notStarted++;
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
  const totalInProgress = assignments?.filter((a: any) => !a.completed && (a.progressPercentage || 0) > 0 && !(a.deadline && new Date(a.deadline) < now)).length || 0;
  const totalNotStarted = totalAssignments - totalCompleted - totalOverdue - totalInProgress;
  const completionRate = totalAssignments > 0 ? Math.round((totalCompleted / totalAssignments) * 100) : 0;

  // Chart data
  const pieData = [
    { name: "Tamamlanan", value: totalCompleted },
    { name: "Devam Eden", value: totalInProgress },
    { name: "Süresi Geçen", value: totalOverdue },
    { name: "Başlanmamış", value: totalNotStarted },
  ].filter(d => d.value > 0);

  const courseBarData = courseRows.map(([, c]) => ({
    name: c.title.length > 20 ? c.title.slice(0, 20) + "…" : c.title,
    Tamamlanan: c.completed,
    "Devam Eden": c.inProgress,
    "Süresi Geçen": c.overdue,
    "Başlanmamış": c.notStarted,
  }));

  const getStatus = (a: any) => {
    if (a.completed) return "Tamamlandı";
    if (a.deadline && new Date(a.deadline) < now) return "Süresi Geçti";
    if ((a.progressPercentage || 0) > 0) return "Devam Ediyor";
    return "Başlanmadı";
  };

  const exportCSV = () => {
    if (!assignments || assignments.length === 0) return;

    // Sheet 1: Detailed assignments
    const detailHeaders = ["Personel", "Eğitim", "İlerleme (%)", "Durum", "Son Tarih", "Atanma Tarihi", "Tamamlanma Tarihi", "Sertifika"];
    const detailRows = assignments.map((a: any) => [
      a.profile?.full_name || "İsimsiz",
      a.course?.title || "Bilinmiyor",
      a.progressPercentage || 0,
      getStatus(a),
      a.deadline ? new Date(a.deadline).toLocaleDateString("tr-TR") : "-",
      new Date(a.assigned_at).toLocaleDateString("tr-TR"),
      a.completed_at ? new Date(a.completed_at).toLocaleDateString("tr-TR") : "-",
      a.hasCertificate ? "Evet" : "Hayır",
    ]);

    // Sheet 2: User summary
    const userHeaders = ["Personel", "Toplam Atama", "Tamamlanan", "Devam Eden", "Süresi Geçen", "Başlanmamış", "Ort. İlerleme (%)", "Başarı Oranı (%)"];
    const userDataRows = userRows.map(([, u]) => [
      u.name,
      u.total,
      u.completed,
      u.inProgress,
      u.overdue,
      u.notStarted,
      u.avgProgress,
      u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0,
    ]);

    // Sheet 3: Course summary
    const courseHeaders = ["Eğitim", "Atanan Kişi", "Tamamlayan", "Devam Eden", "Süresi Geçen", "Başlanmamış", "Ort. İlerleme (%)", "Tamamlanma Oranı (%)"];
    const courseDataRows = courseRows.map(([, c]) => [
      c.title,
      c.total,
      c.completed,
      c.inProgress,
      c.overdue,
      c.notStarted,
      c.avgProgress,
      c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    ]);

    // Summary row
    const summarySection = [
      [""],
      ["GENEL ÖZET"],
      ["Toplam Personel", userSummary.size],
      ["Toplam Atama", totalAssignments],
      ["Tamamlanan", totalCompleted],
      ["Devam Eden", totalInProgress],
      ["Süresi Geçen", totalOverdue],
      ["Başlanmamış", totalNotStarted],
      ["Tamamlanma Oranı (%)", completionRate],
      ["Rapor Tarihi", new Date().toLocaleDateString("tr-TR")],
    ];

    const allRows = [
      ...summarySection,
      [""],
      ["DETAYLI ATAMA RAPORU"],
      detailHeaders,
      ...detailRows,
      [""],
      ["PERSONEL BAZLI RAPOR"],
      userHeaders,
      ...userDataRows,
      [""],
      ["EĞİTİM BAZLI RAPOR"],
      courseHeaders,
      ...courseDataRows,
    ];

    const csvContent = allRows.map(r => r.map(v => `"${v}"`).join(";")).join("\n");
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Genel Özet</h3>
        <Button onClick={exportCSV} disabled={!assignments || assignments.length === 0}>
          <Download className="w-4 h-4 mr-2" /> CSV İndir
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">{userSummary.size}</p>
            <p className="text-xs text-muted-foreground">Toplam Personel</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">%{completionRate}</p>
            <p className="text-xs text-muted-foreground">Tamamlanma Oranı</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Tamamlanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{totalInProgress}</p>
            <p className="text-xs text-muted-foreground">Devam Eden</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{totalOverdue}</p>
            <p className="text-xs text-muted-foreground">Süresi Geçen</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Durum Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={["hsl(142,76%,36%)", "hsl(217,91%,60%)", "hsl(0,84%,60%)", "hsl(240,5%,65%)"][i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Adet"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Veri bulunamadı</p>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eğitim Bazlı Dağılım</CardTitle>
          </CardHeader>
          <CardContent>
            {courseBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={courseBarData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Tamamlanan" stackId="a" fill="hsl(142,76%,36%)" />
                  <Bar dataKey="Devam Eden" stackId="a" fill="hsl(217,91%,60%)" />
                  <Bar dataKey="Süresi Geçen" stackId="a" fill="hsl(0,84%,60%)" />
                  <Bar dataKey="Başlanmamış" stackId="a" fill="hsl(240,5%,65%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Veri bulunamadı</p>
            )}
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
                <TableHead>Devam Eden</TableHead>
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
                  <TableCell><span className="text-green-600 font-medium">{u.completed}</span></TableCell>
                  <TableCell><span className="text-blue-600">{u.inProgress}</span></TableCell>
                  <TableCell>
                    {u.overdue > 0 ? <Badge variant="destructive">{u.overdue}</Badge> : <span className="text-muted-foreground">0</span>}
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground">Veri bulunamadı</TableCell>
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
                <TableHead>Devam Eden</TableHead>
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
                  <TableCell><span className="text-green-600 font-medium">{c.completed}</span></TableCell>
                  <TableCell><span className="text-blue-600">{c.inProgress}</span></TableCell>
                  <TableCell>
                    {c.overdue > 0 ? <Badge variant="destructive">{c.overdue}</Badge> : <span className="text-muted-foreground">0</span>}
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground">Veri bulunamadı</TableCell>
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
