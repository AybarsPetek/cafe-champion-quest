import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, Users, BookOpen, Video, Award, Download, UserCheck, HelpCircle, Upload, Link, CreditCard, Building, ClipboardList } from "lucide-react";
import QuizManagement from "@/components/admin/QuizManagement";
import PaymentManagement from "@/components/admin/PaymentManagement";
import ContactManagement from "@/components/admin/ContactManagement";
import TrainingManagement from "@/components/admin/TrainingManagement";
import {
  useAdminUsers,
  useAdminCourses,
  useAdminVideos,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useCreateVideo,
  useUpdateVideo,
  useDeleteVideo,
  useUpdateUserRole,
  useAdminCertificates,
  useIssueCertificate,
  usePendingUsers,
  useApproveUser,
  useRejectUser,
  useUploadVideo,
} from "@/hooks/useAdmin";
import { useCertificate } from "@/hooks/useCertificate";

const Admin = () => {
  const { data: users } = useAdminUsers();
  const { data: courses } = useAdminCourses();
  const { data: videos } = useAdminVideos();
  const { data: certificates } = useAdminCertificates();
  const { data: pendingUsers } = usePendingUsers();
  
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();
  const updateUserRole = useUpdateUserRole();
  const issueCertificate = useIssueCertificate();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const uploadVideo = useUploadVideo();
  const { generateCertificate } = useCertificate();

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    level: "Başlangıç",
    duration_minutes: 0,
    points: 0,
    instructor: "",
    image_url: "",
  });
  const [videoFormData, setVideoFormData] = useState({
    course_id: "",
    title: "",
    video_url: "",
    duration_minutes: 0,
    order_index: 0,
  });

  const handleCourseSubmit = () => {
    if (selectedCourse) {
      updateCourse.mutate({ id: selectedCourse.id, ...courseFormData });
    } else {
      createCourse.mutate(courseFormData);
    }
    setCourseDialogOpen(false);
    resetCourseForm();
  };

  const handleVideoSubmit = () => {
    if (selectedVideo) {
      updateVideo.mutate({ id: selectedVideo.id, ...videoFormData });
    } else {
      createVideo.mutate(videoFormData);
    }
    setVideoDialogOpen(false);
    resetVideoForm();
  };

  const resetCourseForm = () => {
    setSelectedCourse(null);
    setCourseFormData({
      title: "",
      description: "",
      level: "Başlangıç",
      duration_minutes: 0,
      points: 0,
      instructor: "",
      image_url: "",
    });
  };

  const resetVideoForm = () => {
    setSelectedVideo(null);
    setVideoFormData({
      course_id: "",
      title: "",
      video_url: "",
      duration_minutes: 0,
      order_index: 0,
    });
    setUploadMode('url');
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !videoFormData.course_id) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const url = await uploadVideo.mutateAsync({ file, courseId: videoFormData.course_id });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setVideoFormData(prev => ({ ...prev, video_url: url }));
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const openEditCourse = (course: any) => {
    setSelectedCourse(course);
    setCourseFormData({
      title: course.title,
      description: course.description,
      level: course.level,
      duration_minutes: course.duration_minutes,
      points: course.points,
      instructor: course.instructor || "",
      image_url: course.image_url || "",
    });
    setCourseDialogOpen(true);
  };

  const openEditVideo = (video: any) => {
    setSelectedVideo(video);
    setVideoFormData({
      course_id: video.course_id,
      title: video.title,
      video_url: video.video_url || "",
      duration_minutes: video.duration_minutes,
      order_index: video.order_index,
    });
    // Detect if URL is from storage
    if (video.video_url?.includes('supabase.co/storage')) {
      setUploadMode('file');
    } else {
      setUploadMode('url');
    }
    setVideoDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Paneli</h1>
          <p className="text-muted-foreground">Sistemi yönetin ve içerikleri düzenleyin</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 lg:w-[1170px]">
            <TabsTrigger value="pending">
              <UserCheck className="w-4 h-4 mr-2" />
              Onay Bekleyen
              {pendingUsers && pendingUsers.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs">
                  {pendingUsers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Kurslar
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="w-4 h-4 mr-2" />
              Videolar
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <HelpCircle className="w-4 h-4 mr-2" />
              Quizler
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="w-4 h-4 mr-2" />
              Sertifikalar
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Ödemeler
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Building className="w-4 h-4 mr-2" />
              İletişim
            </TabsTrigger>
            <TabsTrigger value="training">
              <ClipboardList className="w-4 h-4 mr-2" />
              Eğitim Takip
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Kullanıcılar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Onay Bekleyen Kullanıcılar</CardTitle>
                <CardDescription>Yeni kayıt olan kullanıcıları onaylayın veya reddedin</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers && pendingUsers.length > 0 ? (
                      pendingUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || "İsimsiz"}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString("tr-TR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveUser.mutate(user.id)}
                                disabled={approveUser.isPending}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Onayla
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectUser.mutate(user.id)}
                                disabled={rejectUser.isPending}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Reddet
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Onay bekleyen kullanıcı bulunmuyor
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Kurs Yönetimi</CardTitle>
                    <CardDescription>Kursları görüntüleyin, düzenleyin ve silin</CardDescription>
                  </div>
                  <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetCourseForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Kurs
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedCourse ? "Kurs Düzenle" : "Yeni Kurs Ekle"}</DialogTitle>
                        <DialogDescription>
                          Kurs bilgilerini doldurun
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">Kurs Başlığı</Label>
                          <Input
                            id="title"
                            value={courseFormData.title}
                            onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Açıklama</Label>
                          <Textarea
                            id="description"
                            value={courseFormData.description}
                            onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="level">Seviye</Label>
                            <Select
                              value={courseFormData.level}
                              onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                                <SelectItem value="Orta">Orta</SelectItem>
                                <SelectItem value="İleri">İleri</SelectItem>
                                <SelectItem value="Uzman">Uzman</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="duration">Süre (dakika)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={courseFormData.duration_minutes}
                              onChange={(e) => setCourseFormData({ ...courseFormData, duration_minutes: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="points">Puan</Label>
                            <Input
                              id="points"
                              type="number"
                              value={courseFormData.points}
                              onChange={(e) => setCourseFormData({ ...courseFormData, points: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="instructor">Eğitmen</Label>
                            <Input
                              id="instructor"
                              value={courseFormData.instructor}
                              onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="image_url">Görsel URL</Label>
                          <Input
                            id="image_url"
                            value={courseFormData.image_url}
                            onChange={(e) => setCourseFormData({ ...courseFormData, image_url: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleCourseSubmit}>Kaydet</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Seviye</TableHead>
                      <TableHead>Süre</TableHead>
                      <TableHead>Puan</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses?.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell>{course.duration_minutes} dk</TableCell>
                        <TableCell>{course.points} puan</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditCourse(course)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteCourse.mutate(course.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Video Yönetimi</CardTitle>
                    <CardDescription>Videoları görüntüleyin, düzenleyin ve silin</CardDescription>
                  </div>
                  <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetVideoForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{selectedVideo ? "Video Düzenle" : "Yeni Video Ekle"}</DialogTitle>
                        <DialogDescription>
                          Video bilgilerini doldurun veya dosya yükleyin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="course_select">Kurs</Label>
                          <Select
                            value={videoFormData.course_id}
                            onValueChange={(value) => setVideoFormData({ ...videoFormData, course_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kurs seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses?.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="video_title">Video Başlığı</Label>
                          <Input
                            id="video_title"
                            value={videoFormData.title}
                            onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                          />
                        </div>
                        
                        {/* Upload Mode Toggle */}
                        <div className="grid gap-2">
                          <Label>Video Kaynağı</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={uploadMode === 'url' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setUploadMode('url')}
                              className="flex-1"
                            >
                              <Link className="w-4 h-4 mr-2" />
                              URL
                            </Button>
                            <Button
                              type="button"
                              variant={uploadMode === 'file' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setUploadMode('file')}
                              className="flex-1"
                              disabled={!videoFormData.course_id}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Dosya Yükle
                            </Button>
                          </div>
                        </div>

                        {uploadMode === 'url' ? (
                          <div className="grid gap-2">
                            <Label htmlFor="video_url">Video URL (YouTube, Vimeo, vb.)</Label>
                            <Input
                              id="video_url"
                              value={videoFormData.video_url}
                              onChange={(e) => setVideoFormData({ ...videoFormData, video_url: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=..."
                            />
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            <Label>Video Dosyası (MP4, max 1GB)</Label>
                            <input
                              ref={videoFileInputRef}
                              type="file"
                              accept="video/mp4,video/webm,video/ogg"
                              className="hidden"
                              onChange={handleVideoFileUpload}
                            />
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => videoFileInputRef.current?.click()}
                                disabled={isUploading || !videoFormData.course_id}
                                className="w-full"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {isUploading ? "Yükleniyor..." : "Video Dosyası Seç"}
                              </Button>
                              {isUploading && (
                                <div className="space-y-1">
                                  <Progress value={uploadProgress} className="h-2" />
                                  <p className="text-xs text-muted-foreground text-center">
                                    %{uploadProgress} yüklendi
                                  </p>
                                </div>
                              )}
                              {videoFormData.video_url && videoFormData.video_url.includes('supabase.co') && (
                                <p className="text-xs text-primary flex items-center gap-1">
                                  ✓ Video yüklendi
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="video_duration">Süre (dakika)</Label>
                            <Input
                              id="video_duration"
                              type="number"
                              value={videoFormData.duration_minutes}
                              onChange={(e) => setVideoFormData({ ...videoFormData, duration_minutes: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="order_index">Sıra</Label>
                            <Input
                              id="order_index"
                              type="number"
                              value={videoFormData.order_index}
                              onChange={(e) => setVideoFormData({ ...videoFormData, order_index: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleVideoSubmit} disabled={isUploading}>
                          {isUploading ? "Yükleniyor..." : "Kaydet"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kurs</TableHead>
                      <TableHead>Video Başlığı</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Süre</TableHead>
                      <TableHead>Sıra</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos && videos.length > 0 ? (
                      videos.map((video: any) => {
                        const courseTitle = video.courses?.title || "Bilinmiyor";
                        return (
                          <TableRow key={video.id}>
                            <TableCell className="font-medium">
                              {courseTitle}
                            </TableCell>
                            <TableCell>{video.title}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {video.video_url || "-"}
                            </TableCell>
                            <TableCell>{video.duration_minutes} dk</TableCell>
                            <TableCell>{video.order_index}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditVideo(video)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteVideo.mutate(video.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Henüz video eklenmemiş
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Sertifika Yönetimi</CardTitle>
                <CardDescription>Tamamlanan kurslar için sertifika oluşturun ve yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Kurs</TableHead>
                      <TableHead>Tamamlanma Tarihi</TableHead>
                      <TableHead>Sertifika Durumu</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates && certificates.length > 0 ? (
                      certificates.map((cert: any) => {
                        const hasCertificate = cert.certificates && cert.certificates.length > 0;
                        return (
                          <TableRow key={`${cert.user_id}-${cert.course_id}`}>
                            <TableCell className="font-medium">
                              {cert.profiles?.full_name || "İsimsiz"}
                            </TableCell>
                            <TableCell>{cert.courses?.title || "Bilinmiyor"}</TableCell>
                            <TableCell>
                              {cert.completed_at ? new Date(cert.completed_at).toLocaleDateString("tr-TR") : "-"}
                            </TableCell>
                            <TableCell>
                              {hasCertificate ? (
                                <span className="flex items-center gap-2 text-primary">
                                  <Award className="w-4 h-4" />
                                  Verildi
                                  <span className="text-xs text-muted-foreground">
                                    ({cert.certificates[0].certificate_number})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Verilmedi</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {!hasCertificate && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      issueCertificate.mutate({
                                        userId: cert.user_id,
                                        courseId: cert.course_id,
                                      });
                                    }}
                                    disabled={issueCertificate.isPending}
                                  >
                                    <Award className="w-4 h-4 mr-1" />
                                    Sertifika Ver
                                  </Button>
                                )}
                                {hasCertificate && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      generateCertificate.mutate({
                                        userId: cert.user_id,
                                        courseId: cert.course_id,
                                        userName: cert.profiles?.full_name || "Kullanıcı",
                                        courseName: cert.courses?.title || "Kurs",
                                      });
                                    }}
                                    disabled={generateCertificate.isPending}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    PDF İndir
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Henüz tamamlanmış kurs bulunmuyor
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <TrainingManagement />
          </TabsContent>

          <TabsContent value="contact">
            <ContactManagement />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
                <CardDescription>Kullanıcıları görüntüleyin ve rollerini düzenleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>Seviye</TableHead>
                      <TableHead>Toplam Puan</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "İsimsiz"}</TableCell>
                        <TableCell>{user.level}</TableCell>
                        <TableCell>{user.total_points} puan</TableCell>
                        <TableCell>
                          {user.role === 'admin' ? (
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded-md text-sm">Admin</span>
                          ) : (
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-sm">Kullanıcı</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(role: 'admin' | 'user') => 
                              updateUserRole.mutate({ userId: user.id, role })
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Kullanıcı</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
