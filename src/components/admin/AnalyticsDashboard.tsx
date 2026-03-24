import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, Award, Video, TrendingUp, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const LEVEL_COLORS: Record<string, string> = {
  "Başlangıç": "hsl(217, 91%, 60%)",
  "Orta": "hsl(142, 76%, 36%)",
  "İleri": "hsl(35, 85%, 55%)",
  "Uzman": "hsl(0, 84%, 60%)",
};

const AnalyticsDashboard = () => {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) return <p className="text-center text-muted-foreground py-12">Veri yüklenemedi</p>;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Toplam Kullanıcı</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-[10px]">{data.approvedUsers} onaylı</Badge>
              {data.pendingUsers > 0 && (
                <Badge variant="destructive" className="text-[10px]">{data.pendingUsers} bekleyen</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <BookOpen className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data.totalCourses}</p>
                <p className="text-xs text-muted-foreground">Toplam Kurs</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Video className="h-3 w-3" /> {data.totalVideos} video
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data.totalCertificates}</p>
                <p className="text-xs text-muted-foreground">Verilen Sertifika</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">%{data.quizPassRate}</p>
                <p className="text-xs text-muted-foreground">Quiz Başarı Oranı</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {data.totalQuizAttempts} deneme
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registrations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aylık Kayıtlar</CardTitle>
            <CardDescription>Son 6 aylık kullanıcı kayıt trendi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.monthlyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Kayıt"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Seviye Dağılımı</CardTitle>
            <CardDescription>Onaylı kullanıcıların seviye dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            {data.levelDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.levelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="level"
                    label={({ level, percent }) => `${level} %${(percent * 100).toFixed(0)}`}
                    labelLine={false}
                  >
                    {data.levelDistribution.map((entry) => (
                      <Cell key={entry.level} fill={LEVEL_COLORS[entry.level] || "hsl(var(--muted-foreground))"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Kişi"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Veri bulunamadı</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Kurs Performansı
          </CardTitle>
          <CardDescription>Her kursun kayıt, tamamlanma ve ortalama ilerleme durumu</CardDescription>
        </CardHeader>
        <CardContent>
          {data.courseStats.length > 0 ? (
            <div className="space-y-4">
              {data.courseStats.map((course) => (
                <div key={course.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border/50 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{course.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {course.enrolled} kayıtlı
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" /> {course.completed} tamamladı
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" /> {course.videoCount} video
                        </span>
                        {course.rating !== null && course.rating > 0 && (
                          <span>⭐ {Number(course.rating).toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={course.avgProgress >= 80 ? "default" : "secondary"} className="shrink-0">
                      %{course.avgProgress}
                    </Badge>
                  </div>
                  <Progress value={course.avgProgress} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Henüz kurs bulunmuyor</p>
          )}
        </CardContent>
      </Card>

      {/* Platform Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Platform Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-foreground">%{data.avgCourseProgress}</p>
              <p className="text-xs text-muted-foreground">Ort. Kurs İlerlemesi</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-foreground">{data.totalQuizAttempts}</p>
              <p className="text-xs text-muted-foreground">Quiz Denemesi</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-foreground">{data.totalVideos}</p>
              <p className="text-xs text-muted-foreground">Toplam Video</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-foreground">{data.totalCertificates}</p>
              <p className="text-xs text-muted-foreground">Sertifika</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
