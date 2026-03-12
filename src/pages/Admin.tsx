import { useState, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, BookOpen, Video, Award, Download, UserCheck, HelpCircle, Upload, Link, CreditCard, Building, ClipboardList, FileSpreadsheet, Menu } from "lucide-react";
import QuizManagement from "@/components/admin/QuizManagement";
import PaymentManagement from "@/components/admin/PaymentManagement";
import ContactManagement from "@/components/admin/ContactManagement";
import TrainingManagement from "@/components/admin/TrainingManagement";
import UserManagement from "@/components/admin/UserManagement";
import PersonnelImport from "@/components/admin/PersonnelImport";
import LibraryManagement from "@/components/admin/LibraryManagement";
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
  const [activeTab, setActiveTab] = useState("pending");

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
    instructor_title: "",
    instructor_bio: "",
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
      instructor_title: "",
      instructor_bio: "",
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
      instructor_title: course.instructor_title || "",
      instructor_bio: course.instructor_bio || "",
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
    if (video.video_url?.includes('supabase.co/storage')) {
      setUploadMode('file');
    } else {
      setUploadMode('url');
    }
    setVideoDialogOpen(true);
  };

  const getTabTitle = () => {
    const titles: Record<string, { title: string; desc: string }> = {
      pending: { title: "Onay Bekleyen", desc: "Yeni kayıt olan kullanıcıları onaylayın veya reddedin" },
      courses: { title: "Kurs Yönetimi", desc: "Kursları görüntüleyin, düzenleyin ve silin" },
      videos: { title: "Video Yönetimi", desc: "Videoları görüntüleyin, düzenleyin ve silin" },
      quizzes: { title: "Quiz Yönetimi", desc: "Kurslarınız için quiz oluşturun ve yönetin" },
      certificates: { title: "Sertifika Yönetimi", desc: "Tamamlanan kurslar için sertifika oluşturun" },
      payments: { title: "Ödeme Ayarları", desc: "Ödeme planlarını ve banka bilgilerini yönetin" },
      contact: { title: "İletişim Ayarları", desc: "Şirket iletişim bilgilerini düzenleyin" },
      training: { title: "Eğitim Takip", desc: "Personellere atanan eğitimleri takip edin" },
      users: { title: "Kullanıcı Yönetimi", desc: "Kullanıcı bilgilerini görüntüleyin ve düzenleyin" },
      import: { title: "Personel İçe Aktarma", desc: "Excel dosyasından toplu personel içe aktarın" },
      library: { title: "E-Kütüphane Yönetimi", desc: "Dökümanları, tebliğleri ve evrakları yönetin" },
    };
    return titles[activeTab] || { title: "", desc: "" };
  };

  const renderContent = () => {
    switch (activeTab) {
      case "pending":
        return (
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead className="hidden sm:table-cell">Kayıt Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers && pendingUsers.length > 0 ? (
                    pendingUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "İsimsiz"}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {new Date(user.created_at).toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approveUser.mutate(user.id)} disabled={approveUser.isPending}>
                              <UserCheck className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">Onayla</span>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectUser.mutate(user.id)} disabled={rejectUser.isPending}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">Reddet</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                        Onay bekleyen kullanıcı bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "courses":
        return (
          <>
            <div className="flex justify-end mb-4">
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
                    <DialogDescription>Kurs bilgilerini doldurun</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Kurs Başlığı</Label>
                      <Input id="title" value={courseFormData.title} onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea id="description" value={courseFormData.description} onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })} rows={4} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="level">Seviye</Label>
                        <Select value={courseFormData.level} onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <Input id="duration" type="number" value={courseFormData.duration_minutes} onChange={(e) => setCourseFormData({ ...courseFormData, duration_minutes: parseInt(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="points">Puan</Label>
                        <Input id="points" type="number" value={courseFormData.points} onChange={(e) => setCourseFormData({ ...courseFormData, points: parseInt(e.target.value) })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="instructor">Eğitmen</Label>
                        <Input id="instructor" value={courseFormData.instructor} onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="instructor_title">Eğitmen Unvanı</Label>
                        <Input id="instructor_title" value={courseFormData.instructor_title} onChange={(e) => setCourseFormData({ ...courseFormData, instructor_title: e.target.value })} placeholder="Örn: Baş Barista" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="instructor_bio">Eğitmen Hakkında</Label>
                        <Input id="instructor_bio" value={courseFormData.instructor_bio} onChange={(e) => setCourseFormData({ ...courseFormData, instructor_bio: e.target.value })} placeholder="Örn: 10+ yıl deneyim" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image_url">Görsel URL</Label>
                      <Input id="image_url" value={courseFormData.image_url} onChange={(e) => setCourseFormData({ ...courseFormData, image_url: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleCourseSubmit}>Kaydet</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead className="hidden sm:table-cell">Seviye</TableHead>
                    <TableHead className="hidden md:table-cell">Süre</TableHead>
                    <TableHead className="hidden md:table-cell">Puan</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses?.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{course.title}</span>
                          <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                            {course.level} · {course.duration_minutes} dk · {course.points} puan
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{course.level}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{course.duration_minutes} dk</TableCell>
                      <TableCell className="hidden md:table-cell">{course.points} puan</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEditCourse(course)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCourse.mutate(course.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        );

      case "videos":
        return (
          <>
            <div className="flex justify-end mb-4">
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
                    <DialogDescription>Video bilgilerini doldurun veya dosya yükleyin</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="course_select">Kurs</Label>
                      <Select value={videoFormData.course_id} onValueChange={(value) => setVideoFormData({ ...videoFormData, course_id: value })}>
                        <SelectTrigger><SelectValue placeholder="Kurs seçin" /></SelectTrigger>
                        <SelectContent>
                          {courses?.map((course) => (
                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="video_title">Video Başlığı</Label>
                      <Input id="video_title" value={videoFormData.title} onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Video Kaynağı</Label>
                      <div className="flex gap-2">
                        <Button type="button" variant={uploadMode === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setUploadMode('url')} className="flex-1">
                          <Link className="w-4 h-4 mr-2" />URL
                        </Button>
                        <Button type="button" variant={uploadMode === 'file' ? 'default' : 'outline'} size="sm" onClick={() => setUploadMode('file')} className="flex-1" disabled={!videoFormData.course_id}>
                          <Upload className="w-4 h-4 mr-2" />Dosya Yükle
                        </Button>
                      </div>
                    </div>
                    {uploadMode === 'url' ? (
                      <div className="grid gap-2">
                        <Label htmlFor="video_url">Video URL (YouTube, Vimeo, vb.)</Label>
                        <Input id="video_url" value={videoFormData.video_url} onChange={(e) => setVideoFormData({ ...videoFormData, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label>Video Dosyası (MP4, max 1GB)</Label>
                        <input ref={videoFileInputRef} type="file" accept="video/mp4,video/webm,video/ogg" className="hidden" onChange={handleVideoFileUpload} />
                        <div className="space-y-2">
                          <Button type="button" variant="outline" onClick={() => videoFileInputRef.current?.click()} disabled={isUploading || !videoFormData.course_id} className="w-full">
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading ? "Yükleniyor..." : "Video Dosyası Seç"}
                          </Button>
                          {isUploading && (
                            <div className="space-y-1">
                              <Progress value={uploadProgress} className="h-2" />
                              <p className="text-xs text-muted-foreground text-center">%{uploadProgress} yüklendi</p>
                            </div>
                          )}
                          {videoFormData.video_url && videoFormData.video_url.includes('supabase.co') && (
                            <p className="text-xs text-primary flex items-center gap-1">✓ Video yüklendi</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="video_duration">Süre (dakika)</Label>
                        <Input id="video_duration" type="number" value={videoFormData.duration_minutes} onChange={(e) => setVideoFormData({ ...videoFormData, duration_minutes: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="order_index">Sıra</Label>
                        <Input id="order_index" type="number" value={videoFormData.order_index} onChange={(e) => setVideoFormData({ ...videoFormData, order_index: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleVideoSubmit} disabled={isUploading}>{isUploading ? "Yükleniyor..." : "Kaydet"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kurs</TableHead>
                    <TableHead>Video Başlığı</TableHead>
                    <TableHead className="hidden md:table-cell">URL</TableHead>
                    <TableHead className="hidden sm:table-cell">Süre</TableHead>
                    <TableHead className="hidden sm:table-cell">Sıra</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos && videos.length > 0 ? (
                    videos.map((video: any) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.courses?.title || "Bilinmiyor"}</TableCell>
                        <TableCell>{video.title}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">{video.video_url || "-"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{video.duration_minutes} dk</TableCell>
                        <TableCell className="hidden sm:table-cell">{video.order_index}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => openEditVideo(video)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteVideo.mutate(video.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">Henüz video eklenmemiş</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        );

      case "quizzes":
        return <QuizManagement />;

      case "payments":
        return <PaymentManagement />;

      case "certificates":
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Kurs</TableHead>
                  <TableHead className="hidden sm:table-cell">Tamamlanma</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates && certificates.length > 0 ? (
                  certificates.map((cert: any) => {
                    const hasCertificate = cert.certificates && cert.certificates.length > 0;
                    return (
                      <TableRow key={`${cert.user_id}-${cert.course_id}`}>
                        <TableCell className="font-medium">{cert.profiles?.full_name || "İsimsiz"}</TableCell>
                        <TableCell>{cert.courses?.title || "Bilinmiyor"}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {cert.completed_at ? new Date(cert.completed_at).toLocaleDateString("tr-TR") : "-"}
                        </TableCell>
                        <TableCell>
                          {hasCertificate ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <Award className="w-3 h-3 mr-1" />Verildi
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Verilmedi</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!hasCertificate && (
                              <Button size="sm" onClick={() => issueCertificate.mutate({ userId: cert.user_id, courseId: cert.course_id })} disabled={issueCertificate.isPending}>
                                <Award className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Sertifika Ver</span>
                              </Button>
                            )}
                            {hasCertificate && (
                              <Button size="sm" variant="outline" onClick={() => generateCertificate.mutate({ userId: cert.user_id, courseId: cert.course_id, userName: cert.profiles?.full_name || "Kullanıcı", courseName: cert.courses?.title || "Kurs" })} disabled={generateCertificate.isPending}>
                                <Download className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">PDF</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">Henüz tamamlanmış kurs bulunmuyor</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        );

      case "training":
        return <TrainingManagement />;

      case "contact":
        return <ContactManagement />;

      case "users":
        return <UserManagement />;

      case "import":
        return <PersonnelImport />;

      case "library":
        return <LibraryManagement />;

      default:
        return null;
    }
  };

  const { title, desc } = getTabTitle();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingUsers?.length}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <SidebarTrigger className="shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">{desc}</p>
            </div>

            {/* Quick stats */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>{courses?.length || 0} kurs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span>{users?.length || 0} kullanıcı</span>
              </div>
              {pendingUsers && pendingUsers.length > 0 && (
                <Badge variant="destructive" className="text-[10px] h-5">
                  {pendingUsers.length} onay bekliyor
                </Badge>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Card className="shadow-sm">
              <CardContent className="p-4 md:p-6">
                {renderContent()}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
