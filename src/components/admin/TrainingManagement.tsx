import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Mail, AlertTriangle, CheckCircle, Clock, Award, BookOpen } from "lucide-react";
import {
  useTrainingAssignments,
  useMandatoryCourses,
  useToggleMandatory,
  useAssignCourse,
  useDeleteAssignment,
  useSendReminder,
} from "@/hooks/useTrainingManagement";
import { useAdminUsers } from "@/hooks/useAdmin";

const TrainingManagement = () => {
  const { data: assignments, isLoading } = useTrainingAssignments();
  const { data: courses } = useMandatoryCourses();
  const { data: users } = useAdminUsers();
  const toggleMandatory = useToggleMandatory();
  const assignCourse = useAssignCourse();
  const deleteAssignment = useDeleteAssignment();
  const sendReminder = useSendReminder();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all");

  const handleAssign = () => {
    if (!selectedUserId || !selectedCourseId) return;
    assignCourse.mutate(
      { userId: selectedUserId, courseId: selectedCourseId, deadline: deadline || undefined },
      { onSuccess: () => { setAssignDialogOpen(false); setSelectedUserId(""); setSelectedCourseId(""); setDeadline(""); } }
    );
  };

  const getStatusBadge = (assignment: any) => {
    if (assignment.completed) {
      return <Badge className="bg-green-500/20 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Tamamlandı</Badge>;
    }
    if (assignment.deadline && new Date(assignment.deadline) < new Date()) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Süresi Geçti</Badge>;
    }
    if (assignment.progressPercentage > 0) {
      return <Badge className="bg-blue-500/20 text-blue-700 border-blue-300"><Clock className="w-3 h-3 mr-1" /> Devam Ediyor</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Başlanmadı</Badge>;
  };

  const filteredAssignments = assignments?.filter(a => {
    if (filter === "completed") return a.completed;
    if (filter === "pending") return !a.completed;
    if (filter === "overdue") return !a.completed && a.deadline && new Date(a.deadline) < new Date();
    return true;
  });

  const stats = {
    total: assignments?.length || 0,
    completed: assignments?.filter(a => a.completed).length || 0,
    pending: assignments?.filter(a => !a.completed).length || 0,
    overdue: assignments?.filter(a => !a.completed && a.deadline && new Date(a.deadline) < new Date()).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer" onClick={() => setFilter("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Toplam Atama</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter("completed")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Tamamlanan</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter("pending")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Devam Eden</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter("overdue")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
            <p className="text-sm text-muted-foreground">Süresi Geçen</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Eğitim Atamaları</TabsTrigger>
          <TabsTrigger value="mandatory">Zorunlu Eğitimler</TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Eğitim Atamaları</CardTitle>
                  <CardDescription>Personellere atanan eğitimleri takip edin</CardDescription>
                </div>
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" /> Eğitim Ata</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Eğitim Ataması</DialogTitle>
                      <DialogDescription>Bir personele eğitim atayın</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Personel</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger><SelectValue placeholder="Personel seçin" /></SelectTrigger>
                          <SelectContent>
                            {users?.filter((u: any) => u.is_approved).map((u: any) => (
                              <SelectItem key={u.id} value={u.id}>{u.full_name || "İsimsiz"}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Eğitim</Label>
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                          <SelectTrigger><SelectValue placeholder="Eğitim seçin" /></SelectTrigger>
                          <SelectContent>
                            {courses?.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.title} {c.is_mandatory && "⭐"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Son Tamamlanma Tarihi (Opsiyonel)</Label>
                        <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>İptal</Button>
                      <Button onClick={handleAssign} disabled={!selectedUserId || !selectedCourseId || assignCourse.isPending}>
                        {assignCourse.isPending ? "Atanıyor..." : "Ata"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Personel</TableHead>
                      <TableHead>Eğitim</TableHead>
                      <TableHead>İlerleme</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Son Tarih</TableHead>
                      <TableHead>Son Aktivite</TableHead>
                      <TableHead>Sertifika</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments && filteredAssignments.length > 0 ? (
                      filteredAssignments.map((a: any) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.profile?.full_name || "İsimsiz"}</TableCell>
                          <TableCell>{a.course?.title || "Bilinmiyor"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <Progress value={a.progressPercentage} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">%{a.progressPercentage}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(a)}</TableCell>
                          <TableCell>
                            {a.deadline ? (
                              <span className={!a.completed && new Date(a.deadline) < new Date() ? "text-destructive font-medium" : ""}>
                                {new Date(a.deadline).toLocaleDateString("tr-TR")}
                              </span>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(a.lastActivity).toLocaleDateString("tr-TR")}
                          </TableCell>
                          <TableCell>
                            {a.hasCertificate ? (
                              <Award className="w-4 h-4 text-primary" />
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {!a.completed && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendReminder.mutate({
                                    assignmentId: a.id,
                                    userId: a.user_id,
                                    courseTitle: a.course?.title || "",
                                    userName: a.profile?.full_name,
                                  })}
                                  disabled={sendReminder.isPending}
                                  title="Hatırlatma Gönder"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteAssignment.mutate(a.id)}
                                title="Atamayı Kaldır"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          {filter !== "all" ? "Bu filtreye uygun atama bulunamadı" : "Henüz eğitim ataması yapılmamış"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mandatory Courses Tab */}
        <TabsContent value="mandatory">
          <Card>
            <CardHeader>
              <CardTitle>Zorunlu Eğitimler</CardTitle>
              <CardDescription>
                Zorunlu olarak işaretlenen eğitimler, yeni onaylanan personellere otomatik olarak atanır
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eğitim</TableHead>
                    <TableHead>Zorunlu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses?.map(course => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          {course.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={course.is_mandatory}
                          onCheckedChange={(checked) => toggleMandatory.mutate({ courseId: course.id, isMandatory: checked })}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingManagement;
