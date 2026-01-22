import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import {
  useAdminQuizzes,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  useQuizQuestions,
  useCreateQuestion,
  useDeleteQuestion,
  Quiz,
} from "@/hooks/useQuiz";
import { useAdminCourses } from "@/hooks/useAdmin";

type QuestionType = 'multiple_choice' | 'true_false';

const QuizManagement = () => {
  const { data: quizzes } = useAdminQuizzes();
  const { data: courses } = useAdminCourses();
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [managingQuizId, setManagingQuizId] = useState<string | null>(null);
  
  const [quizFormData, setQuizFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    time_limit_minutes: 30,
    passing_score: 70,
    is_required_for_certificate: true,
    is_active: true,
  });

  const [questionFormData, setQuestionFormData] = useState<{
    question_text: string;
    question_type: QuestionType;
    points: number;
    options: { option_text: string; is_correct: boolean; order_index: number }[];
  }>({
    question_text: "",
    question_type: "multiple_choice",
    points: 10,
    options: [
      { option_text: "", is_correct: false, order_index: 0 },
      { option_text: "", is_correct: false, order_index: 1 },
      { option_text: "", is_correct: false, order_index: 2 },
      { option_text: "", is_correct: false, order_index: 3 },
    ],
  });

  const { data: questions } = useQuizQuestions(managingQuizId || '');

  // Get courses that don't have quizzes yet
  const availableCourses = courses?.filter(
    course => !quizzes?.some(quiz => quiz.course_id === course.id) || 
    (selectedQuiz && selectedQuiz.course_id === course.id)
  );

  const resetQuizForm = () => {
    setSelectedQuiz(null);
    setQuizFormData({
      course_id: "",
      title: "",
      description: "",
      time_limit_minutes: 30,
      passing_score: 70,
      is_required_for_certificate: true,
      is_active: true,
    });
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      question_text: "",
      question_type: "multiple_choice",
      points: 10,
      options: [
        { option_text: "", is_correct: false, order_index: 0 },
        { option_text: "", is_correct: false, order_index: 1 },
        { option_text: "", is_correct: false, order_index: 2 },
        { option_text: "", is_correct: false, order_index: 3 },
      ],
    });
  };

  const openEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizFormData({
      course_id: quiz.course_id,
      title: quiz.title,
      description: quiz.description || "",
      time_limit_minutes: quiz.time_limit_minutes,
      passing_score: quiz.passing_score,
      is_required_for_certificate: quiz.is_required_for_certificate,
      is_active: quiz.is_active,
    });
    setQuizDialogOpen(true);
  };

  const handleQuizSubmit = () => {
    if (selectedQuiz) {
      updateQuiz.mutate({ id: selectedQuiz.id, ...quizFormData });
    } else {
      createQuiz.mutate(quizFormData);
    }
    setQuizDialogOpen(false);
    resetQuizForm();
  };

  const handleQuestionSubmit = () => {
    if (!managingQuizId) return;

    const validOptions = questionFormData.options.filter(o => o.option_text.trim());
    
    createQuestion.mutate({
      question: {
        quiz_id: managingQuizId,
        question_text: questionFormData.question_text,
        question_type: questionFormData.question_type,
        points: questionFormData.points,
        order_index: (questions?.length || 0) + 1,
      },
      options: validOptions,
    });
    
    setQuestionDialogOpen(false);
    resetQuestionForm();
  };

  const handleSetCorrectAnswer = (index: number) => {
    setQuestionFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        is_correct: i === index,
      })),
    }));
  };

  const handleQuestionTypeChange = (value: QuestionType) => {
    setQuestionFormData({ 
      ...questionFormData, 
      question_type: value,
      options: value === 'true_false' 
        ? [
            { option_text: "Doğru", is_correct: false, order_index: 0 },
            { option_text: "Yanlış", is_correct: false, order_index: 1 },
          ]
        : [
            { option_text: "", is_correct: false, order_index: 0 },
            { option_text: "", is_correct: false, order_index: 1 },
            { option_text: "", is_correct: false, order_index: 2 },
            { option_text: "", is_correct: false, order_index: 3 },
          ]
    });
  };

  if (managingQuizId) {
    const currentQuiz = quizzes?.find(q => q.id === managingQuizId);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Button variant="ghost" onClick={() => setManagingQuizId(null)} className="mb-2">
                ← Geri
              </Button>
              <CardTitle>Soru Yönetimi: {currentQuiz?.title}</CardTitle>
              <CardDescription>{currentQuiz?.courses?.title}</CardDescription>
            </div>
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetQuestionForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Soru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni Soru Ekle</DialogTitle>
                  <DialogDescription>Soru bilgilerini ve şıkları doldurun</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Soru Metni</Label>
                    <Textarea
                      value={questionFormData.question_text}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Soru Tipi</Label>
                      <Select
                        value={questionFormData.question_type}
                        onValueChange={handleQuestionTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Çoktan Seçmeli</SelectItem>
                          <SelectItem value="true_false">Doğru/Yanlış</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Puan</Label>
                      <Input
                        type="number"
                        value={questionFormData.points}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) || 10 })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label>Şıklar (Doğru cevabı işaretleyin)</Label>
                    {questionFormData.options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={option.is_correct}
                          onChange={() => handleSetCorrectAnswer(index)}
                          className="w-4 h-4"
                        />
                        <Input
                          value={option.option_text}
                          onChange={(e) => {
                            const newOptions = [...questionFormData.options];
                            newOptions[index].option_text = e.target.value;
                            setQuestionFormData({ ...questionFormData, options: newOptions });
                          }}
                          placeholder={`Şık ${String.fromCharCode(65 + index)}`}
                          disabled={questionFormData.question_type === 'true_false'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>İptal</Button>
                  <Button onClick={handleQuestionSubmit} disabled={createQuestion.isPending}>
                    {createQuestion.isPending ? "Kaydediliyor..." : "Kaydet"}
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
                <TableHead>Sıra</TableHead>
                <TableHead>Soru</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Puan</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions && questions.length > 0 ? (
                questions.map((question, index) => (
                  <TableRow key={question.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{question.question_text}</TableCell>
                    <TableCell>
                      {question.question_type === 'multiple_choice' ? 'Çoktan Seçmeli' : 'D/Y'}
                    </TableCell>
                    <TableCell>{question.points}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteQuestion.mutate({ questionId: question.id, quizId: managingQuizId })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Henüz soru eklenmemiş
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Quiz Yönetimi</CardTitle>
            <CardDescription>Kurs sonu sınavlarını yönetin</CardDescription>
          </div>
          <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetQuizForm}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedQuiz ? "Quiz Düzenle" : "Yeni Quiz Oluştur"}</DialogTitle>
                <DialogDescription>Quiz bilgilerini doldurun</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Kurs</Label>
                  <Select
                    value={quizFormData.course_id}
                    onValueChange={(value) => setQuizFormData({ ...quizFormData, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kurs seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Quiz Başlığı</Label>
                  <Input
                    value={quizFormData.title}
                    onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
                    placeholder="Örn: Final Sınavı"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={quizFormData.description}
                    onChange={(e) => setQuizFormData({ ...quizFormData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Süre Limiti (dk)</Label>
                    <Input
                      type="number"
                      value={quizFormData.time_limit_minutes}
                      onChange={(e) => setQuizFormData({ ...quizFormData, time_limit_minutes: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Geçme Puanı (%)</Label>
                    <Input
                      type="number"
                      value={quizFormData.passing_score}
                      onChange={(e) => setQuizFormData({ ...quizFormData, passing_score: parseInt(e.target.value) || 70 })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sertifika için zorunlu</Label>
                  <Switch
                    checked={quizFormData.is_required_for_certificate}
                    onCheckedChange={(checked) => setQuizFormData({ ...quizFormData, is_required_for_certificate: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Aktif</Label>
                  <Switch
                    checked={quizFormData.is_active}
                    onCheckedChange={(checked) => setQuizFormData({ ...quizFormData, is_active: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setQuizDialogOpen(false)}>İptal</Button>
                <Button onClick={handleQuizSubmit} disabled={createQuiz.isPending || updateQuiz.isPending}>
                  Kaydet
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
              <TableHead>Quiz Başlığı</TableHead>
              <TableHead>Süre</TableHead>
              <TableHead>Geçme Puanı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes && quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.courses?.title || "-"}</TableCell>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.time_limit_minutes} dk</TableCell>
                  <TableCell>%{quiz.passing_score}</TableCell>
                  <TableCell>
                    {quiz.is_active ? (
                      <span className="text-primary text-sm">Aktif</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Pasif</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setManagingQuizId(quiz.id)}
                        title="Soruları Yönet"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditQuiz(quiz)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteQuiz.mutate(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Henüz quiz oluşturulmamış
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default QuizManagement;
