import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  useCourseQuiz, 
  useQuizQuestions, 
  useUserQuizAttempts,
  useStartQuizAttempt,
  useSubmitQuiz 
} from "@/hooks/useQuiz";

type QuizState = 'loading' | 'intro' | 'taking' | 'submitting' | 'result';

const Quiz = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean; percentage: number } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate('/auth');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate('/auth');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: quiz, isLoading: quizLoading } = useCourseQuiz(courseId || '');
  const { data: questions, isLoading: questionsLoading } = useQuizQuestions(quiz?.id || '');
  const { data: attempts } = useUserQuizAttempts(user?.id || '', quiz?.id || '');
  const startAttempt = useStartQuizAttempt();
  const submitQuiz = useSubmitQuiz();

  // Check if user already passed
  const hasPassed = attempts?.some(a => a.passed) || false;

  useEffect(() => {
    if (!quizLoading && !questionsLoading && user) {
      setQuizState('intro');
    }
  }, [quizLoading, questionsLoading, user]);

  const handleSubmit = useCallback(async () => {
    if (!user || !quiz || !attemptId || !questions) return;

    setQuizState('submitting');
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const answerArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    try {
      const result = await submitQuiz.mutateAsync({
        attemptId,
        answers: answerArray,
        timeSpent,
        userId: user.id,
        quizId: quiz.id,
      });
      
      setResult({
        score: result.score || 0,
        total: result.total_points || 0,
        passed: result.passed || false,
        percentage: result.scorePercentage,
      });
      setQuizState('result');
    } catch {
      setQuizState('taking');
    }
  }, [user, quiz, attemptId, questions, answers, startTime, submitQuiz]);

  // Timer countdown
  useEffect(() => {
    if (quizState !== 'taking' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, timeLeft, handleSubmit]);

  const handleStartQuiz = async () => {
    if (!user || !quiz) return;

    try {
      const result = await startAttempt.mutateAsync({ userId: user.id, quizId: quiz.id });
      setAttemptId(result.id);
      setTimeLeft(quiz.time_limit_minutes * 60);
      setStartTime(Date.now());
      setCurrentQuestionIndex(0);
      setAnswers({});
      setQuizState('taking');
    } catch {
      // Error handled in hook
    }
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz && !quizLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-accent mb-4" />
          <h1 className="text-2xl font-bold mb-2">Quiz Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Bu kurs için henüz quiz oluşturulmamış.</p>
          <Button asChild>
            <Link to={`/course/${courseId}`}>Kursa Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (quizState === 'loading' || quizLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {quizState === 'intro' && quiz && (
          <Card className="shadow-soft">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <CardDescription className="text-lg">{quiz.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {hasPassed && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-primary">Bu sınavı daha önce geçtiniz!</p>
                    <p className="text-sm text-muted-foreground">Tekrar denemek isterseniz aşağıdaki butona tıklayın.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{quiz.time_limit_minutes} dk</p>
                  <p className="text-sm text-muted-foreground">Süre Limiti</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <Badge className="mb-2 text-lg px-4 py-1">%{quiz.passing_score}</Badge>
                  <p className="text-sm text-muted-foreground">Geçme Puanı</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Sınav Kuralları:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Toplam {questions?.length || 0} soru bulunmaktadır</li>
                  <li>Süre dolduğunda sınav otomatik gönderilir</li>
                  <li>Her soru için tek bir cevap seçebilirsiniz</li>
                  {quiz.is_required_for_certificate && (
                    <li className="text-primary font-medium">Bu sınavı geçmeniz sertifika almak için zorunludur</li>
                  )}
                </ul>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" asChild className="flex-1">
                  <Link to={`/course/${courseId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kursa Dön
                  </Link>
                </Button>
                <Button onClick={handleStartQuiz} className="flex-1" disabled={startAttempt.isPending}>
                  {startAttempt.isPending ? "Başlatılıyor..." : "Sınava Başla"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {quizState === 'taking' && currentQuestion && questions && (
          <div className="space-y-6">
            {/* Timer & Progress */}
            <Card className="shadow-soft">
              <CardContent className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Soru {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <div className={`flex items-center gap-2 font-mono text-lg ${timeLeft < 60 ? 'text-destructive' : ''}`}>
                    <Clock className="h-5 w-5" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Question */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
                <Badge variant="secondary">{currentQuestion.points} puan</Badge>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
              >
                Önceki
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                {answeredCount} / {questions.length} cevaplandı
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                  Sonraki
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitQuiz.isPending}
                  variant="default"
                >
                  {submitQuiz.isPending ? "Gönderiliyor..." : "Sınavı Bitir"}
                </Button>
              )}
            </div>

            {/* Question Navigator */}
            <Card className="shadow-soft">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground mb-3">Soru Navigasyonu</p>
                <div className="flex flex-wrap gap-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                        currentQuestionIndex === index
                          ? 'border-primary bg-primary text-primary-foreground'
                          : answers[q.id]
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {quizState === 'submitting' && (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">Sınav değerlendiriliyor...</p>
            </CardContent>
          </Card>
        )}

        {quizState === 'result' && result && (
          <Card className="shadow-soft">
            <CardContent className="py-8 text-center space-y-6">
              {result.passed ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-primary">Tebrikler! 🎉</h2>
                  <p className="text-lg text-muted-foreground">Sınavı başarıyla geçtiniz!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <XCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <h2 className="text-3xl font-bold text-destructive">Maalesef</h2>
                  <p className="text-lg text-muted-foreground">Geçme puanına ulaşamadınız. Tekrar deneyin!</p>
                </div>
              )}

              <div className="bg-muted rounded-lg p-6 inline-block">
                <p className="text-5xl font-bold text-primary">%{result.percentage}</p>
                <p className="text-muted-foreground mt-1">
                  {result.score} / {result.total} puan
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link to={`/course/${courseId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kursa Dön
                  </Link>
                </Button>
                {!result.passed && (
                  <Button onClick={handleStartQuiz}>
                    Tekrar Dene
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Quiz;
