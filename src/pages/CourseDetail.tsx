import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Star, CheckCircle, PlayCircle } from "lucide-react";
import brewingImage from "@/assets/course-brewing.jpg";

const CourseDetail = () => {
  const { id } = useParams();

  const course = {
    title: "Kahve Demleme Teknikleri",
    description: "Pour-over, French press, AeroPress ve daha fazlası. Her demleme yöntemini profesyonel seviyede öğrenin. Bu eğitimde kahvenin kimyasını, doğru su sıcaklığını ve ekstraksiyon sürelerini öğreneceksiniz.",
    image: brewingImage,
    duration: "2 saat 30 dk",
    level: "Başlangıç",
    points: 100,
    progress: 25,
    instructor: "Ahmet Yılmaz",
    enrolled: 1234,
    rating: 4.8,
  };

  const videos = [
    { id: 1, title: "Giriş ve Genel Bakış", duration: "15 dk", completed: true },
    { id: 2, title: "Kahve Çekirdeklerini Tanımak", duration: "20 dk", completed: true },
    { id: 3, title: "Pour-Over Tekniği", duration: "25 dk", completed: false, current: true },
    { id: 4, title: "French Press Kullanımı", duration: "18 dk", completed: false },
    { id: 5, title: "AeroPress İle Demleme", duration: "22 dk", completed: false },
    { id: 6, title: "Kalite Kontrolü ve Tadım", duration: "30 dk", completed: false },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Eğitimlere Dön
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden shadow-soft">
              <div className="relative aspect-video bg-muted">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm">
                  <Button size="lg" className="rounded-full w-20 h-20">
                    <PlayCircle className="h-10 w-10" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Course Info */}
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <Badge variant="secondary">{course.level}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="text-lg px-4 py-2">+{course.points} Puan</Badge>
                </div>

                <p className="text-muted-foreground mb-6">{course.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">İlerleme</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Video List */}
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Eğitim İçeriği</h2>
                <div className="space-y-2">
                  {videos.map((video) => (
                    <button
                      key={video.id}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        video.current
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          video.completed
                            ? "bg-primary/10 text-primary"
                            : video.current
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {video.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <PlayCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{video.title}</div>
                        <div className="text-sm text-muted-foreground">{video.duration}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-4">Eğitmen</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">AY</span>
                  </div>
                  <div>
                    <div className="font-semibold">{course.instructor}</div>
                    <div className="text-sm text-muted-foreground">Baş Barista</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  10+ yıllık deneyime sahip profesyonel barista ve eğitmen
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-4">Eğitim Detayları</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kayıtlı Öğrenci</span>
                    <span className="font-semibold">{course.enrolled.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Toplam Video</span>
                    <span className="font-semibold">{videos.length} video</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Süre</span>
                    <span className="font-semibold">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seviye</span>
                    <span className="font-semibold">{course.level}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
