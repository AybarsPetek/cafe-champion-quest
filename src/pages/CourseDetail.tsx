import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import ReviewsSection from "@/components/ReviewsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Star, CheckCircle, PlayCircle, Award, FileQuestion } from "lucide-react";
import { useCourseQuiz, useUserQuizAttempts } from "@/hooks/useQuiz";
import { useCourseDetail } from "@/hooks/useCourseDetail";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

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

  const { data: course, isLoading } = useCourseDetail(id || "", user?.id);
  const { markVideoComplete } = useVideoProgress();
  const { data: quiz } = useCourseQuiz(id || '');
  const { data: quizAttempts } = useUserQuizAttempts(user?.id || '', quiz?.id || '');
  const hasPassedQuiz = quizAttempts?.some(a => a.passed) || false;

  useEffect(() => {
    if (course?.lastWatchedVideoId) {
      setCurrentVideoId(course.lastWatchedVideoId);
    } else if (course?.videos && course.videos.length > 0) {
      setCurrentVideoId(course.videos[0].id);
    }
  }, [course]);

  const handleVideoClick = async (videoId: string) => {
    setCurrentVideoId(videoId);
    
    // Update last watched video in database
    if (user && id) {
      await supabase
        .from("user_course_progress")
        .upsert(
          {
            user_id: user.id,
            course_id: id,
            last_watched_video_id: videoId,
          },
          {
            onConflict: "user_id,course_id",
          }
        );
    }
  };

  const handleMarkComplete = () => {
    if (user && currentVideoId) {
      console.log('Manually marking video complete:', { userId: user.id, videoId: currentVideoId });
      markVideoComplete.mutate({ userId: user.id, videoId: currentVideoId });
    }
  };

  const handleVideoEnd = () => {
    if (user && currentVideoId) {
      console.log('Video ended, auto-marking complete:', { userId: user.id, videoId: currentVideoId });
      markVideoComplete.mutate({ userId: user.id, videoId: currentVideoId });
    }
  };


  if (isLoading || !course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
              <VideoPlayer
                videoUrl={
                  currentVideoId
                    ? course.videos.find((v) => v.id === currentVideoId)?.video_url || null
                    : null
                }
                title={
                  currentVideoId
                    ? course.videos.find((v) => v.id === currentVideoId)?.title || course.title
                    : course.title
                }
                onVideoEnd={handleVideoEnd}
              />
              {user && currentVideoId && (
                <CardContent className="pt-4 space-y-3">
                  <Button onClick={handleMarkComplete} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Videoyu Tamamla
                  </Button>
                </CardContent>
              )}
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
                        <span>{Math.floor(course.duration_minutes / 60)} saat {course.duration_minutes % 60} dk</span>
                      </div>
                      <Badge variant="secondary">{course.level}</Badge>
                      {course.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      )}
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

                {/* Quiz Section */}
                {quiz && course.progress === 100 && (
                  <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <FileQuestion className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">Kurs Sonu Sınavı</p>
                          <p className="text-sm text-muted-foreground">
                            {hasPassedQuiz 
                              ? "Sınavı geçtiniz! ✓" 
                              : quiz.is_required_for_certificate 
                                ? "Sertifika almak için sınavı geçmeniz gerekiyor." 
                                : "Bilgilerinizi test edin."}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant={hasPassedQuiz ? "outline" : "default"}>
                        <Link to={`/quiz/${id}`}>
                          {hasPassedQuiz ? "Tekrar Dene" : "Sınava Git"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Course Completion Message */}
                {course.progress === 100 && (!quiz || hasPassedQuiz) && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Tebrikler! 🎉</p>
                        <p className="text-sm text-muted-foreground">Eğitimi başarıyla tamamladınız. Sertifikanız admin tarafından hazırlandıktan sonra tarafınıza iletilecektir.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video List */}
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Eğitim İçeriği</h2>
                <div className="space-y-2">
                  {course.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoClick(video.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        currentVideoId === video.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          video.completed
                            ? "bg-primary/10 text-primary"
                            : currentVideoId === video.id
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
                        <div className="text-sm text-muted-foreground">{video.duration_minutes} dk</div>
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
                  {course.enrolled_count && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kayıtlı Öğrenci</span>
                      <span className="font-semibold">{course.enrolled_count.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Toplam Video</span>
                    <span className="font-semibold">{course.videos.length} video</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Süre</span>
                    <span className="font-semibold">{Math.floor(course.duration_minutes / 60)} saat {course.duration_minutes % 60} dk</span>
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

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewsSection courseId={id || ""} user={user} />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
