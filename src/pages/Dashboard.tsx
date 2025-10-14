import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Star, Trophy } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import latteArtImage from "@/assets/course-latte-art.jpg";
import beansImage from "@/assets/course-beans.jpg";

const Dashboard = () => {
  const stats = [
    {
      icon: BookOpen,
      label: "Tamamlanan Eğitimler",
      value: "3",
      color: "text-primary",
    },
    {
      icon: Star,
      label: "Toplam Puan",
      value: "850",
      color: "text-accent",
    },
    {
      icon: Trophy,
      label: "Rozetler",
      value: "5",
      color: "text-primary",
    },
    {
      icon: Award,
      label: "Seviye",
      value: "İleri",
      color: "text-accent",
    },
  ];

  const inProgressCourses = [
    {
      id: "2",
      title: "Latte Art Uzmanlığı",
      description: "Süt köpürtme ve latte art tekniklerinde uzmanlaşın.",
      image: latteArtImage,
      duration: "3 saat",
      level: "Orta",
      points: 150,
      progress: 35,
    },
    {
      id: "5",
      title: "Müşteri Hizmetleri",
      description: "Profesyonel bir barista olarak müşteri memnuniyetini en üst seviyeye çıkarın.",
      image: beansImage,
      duration: "2 saat",
      level: "Başlangıç",
      points: 90,
      progress: 65,
    },
  ];

  const badges = [
    { name: "İlk Adım", description: "İlk eğitimi tamamladınız", earned: true },
    { name: "Kahve Uzmanı", description: "5 eğitim tamamladınız", earned: true },
    { name: "Latte Artist", description: "Latte Art eğitimini bitirdiniz", earned: false },
    { name: "Espresso Master", description: "Espresso eğitimini bitirdiniz", earned: true },
    { name: "Puan Avcısı", description: "1000 puana ulaştınız", earned: false },
    { name: "Süreklilik", description: "7 gün üst üste giriş yaptınız", earned: true },
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
                <span className="text-muted-foreground">Seviye 3: İleri Barista</span>
                <span className="font-semibold">850 / 1000 Puan</span>
              </div>
              <Progress value={85} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Bir sonraki seviyeye ulaşmak için 150 puan daha kazanmalısınız!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* In Progress Courses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Devam Eden Eğitimler</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {inProgressCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Rozetlerim</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge, index) => (
              <Card
                key={index}
                className={`text-center p-4 ${
                  badge.earned
                    ? "bg-gradient-card shadow-soft"
                    : "opacity-50 grayscale"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      badge.earned
                        ? "bg-accent/20"
                        : "bg-muted"
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
