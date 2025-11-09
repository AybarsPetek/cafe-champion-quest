import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Star, Trophy } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);

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

  const { data: dashboardData, isLoading } = useUserDashboard(user?.id || "");

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

  const stats = [
    {
      icon: BookOpen,
      label: "Tamamlanan Eğitimler",
      value: dashboardData?.stats.completedCourses.toString() || "0",
      color: "text-primary",
    },
    {
      icon: Star,
      label: "Toplam Puan",
      value: dashboardData?.stats.totalPoints.toString() || "0",
      color: "text-accent",
    },
    {
      icon: Trophy,
      label: "Rozetler",
      value: dashboardData?.stats.badgesCount.toString() || "0",
      color: "text-primary",
    },
    {
      icon: Award,
      label: "Seviye",
      value: dashboardData?.stats.level || "Başlangıç",
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Hoş Geldin, Barista! ☕</h1>
          <p className="text-lg text-muted-foreground">
            İlerlemeni takip et ve yeni rozetler kazan
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Bar */}
        <Card className="mb-12 shadow-soft">
          <CardHeader>
            <CardTitle>Genel İlerleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{dashboardData?.stats.level} Barista</span>
                <span className="font-semibold">{dashboardData?.stats.totalPoints} Puan</span>
              </div>
              <Progress value={dashboardData?.stats.progressToNextLevel || 0} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Bir sonraki seviyeye ulaşmak için daha fazla puan kazanın!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* In Progress Courses */}
        {dashboardData?.inProgressCourses && dashboardData.inProgressCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Devam Eden Eğitimler</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {dashboardData.inProgressCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  image={course.image_url || ""}
                  duration={`${Math.floor(course.duration_minutes / 60)} saat ${course.duration_minutes % 60} dk`}
                  level={course.level}
                  points={course.points}
                  progress={course.progress}
                />
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Rozetlerim</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dashboardData?.badges.map((badge) => (
              <Card
                key={badge.id}
                className={`text-center p-4 ${
                  badge.earned
                    ? "bg-gradient-card shadow-soft"
                    : "opacity-50 grayscale"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      badge.earned ? "bg-accent/20" : "bg-muted"
                    }`}
                  >
                    <Award
                      className={`h-8 w-8 ${
                        badge.earned ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {badge.description}
                    </div>
                  </div>
                  {badge.earned && (
                    <Badge variant="secondary" className="mt-1">
                      Kazanıldı
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
