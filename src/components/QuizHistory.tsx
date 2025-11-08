import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { History, Award, Clock, TrendingUp, ChevronRight, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizSession {
  id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  questions: any[];
  answers: number[];
  topic_name?: string;
  subject_name?: string;
}

export const QuizHistory = () => {
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const db = supabase as any;

      // Fetch quiz sessions
      const sessionsResponse = await db
        .from('quiz_sessions')
        .select('id, topic_id, score, total_questions, completed_at, questions, answers')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (sessionsResponse.error) throw sessionsResponse.error;
      const sessionsData = sessionsResponse.data;

      // Fetch topics
      const topicsResponse = await db
        .from('quiz_topics')
        .select('id, name, subject_id');

      if (topicsResponse.error) throw topicsResponse.error;
      const topics = topicsResponse.data;

      // Fetch subjects
      const subjectsResponse = await db
        .from('quiz_subjects')
        .select('id, name');

      if (subjectsResponse.error) throw subjectsResponse.error;
      const subjects = subjectsResponse.data;

      // Create lookup maps
      const topicMap = new Map(topics?.map((t: any) => [t.id, t]) || []);
      const subjectMap = new Map(subjects?.map((s: any) => [s.id, s.name]) || []);

      // Enrich sessions with topic and subject names
      const enrichedSessions = sessionsData?.map((session: any) => {
        const topic: any = topicMap.get(session.topic_id);
        return {
          ...session,
          topic_name: topic?.name || 'Unknown Topic',
          subject_name: topic ? subjectMap.get(topic.subject_id) || 'Unknown Subject' : 'Unknown Subject',
        };
      }) || [];

      setSessions(enrichedSessions);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-500/10";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-500/10";
    return "text-red-600 bg-red-500/10";
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Great";
    if (percentage >= 70) return "Good";
    if (percentage >= 60) return "Fair";
    return "Needs Work";
  };

  const handleReviewSession = (session: QuizSession) => {
    setSelectedSession(session);
    setIsReviewOpen(true);
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-32 bg-muted rounded"></div>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Quiz History</h3>
        <p className="text-sm text-muted-foreground">
          Your completed quizzes will appear here
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Quiz History</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Review your past quizzes and track your improvement
        </p>
        <div className="space-y-3">
          {sessions.map((session) => {
            const percentage = (session.score / session.total_questions) * 100;
            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group cursor-pointer"
                onClick={() => handleReviewSession(session)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{session.topic_name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {session.subject_name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(session.completed_at), "MMM d, yyyy")}
                    </span>
                    <span>•</span>
                    <span>{session.total_questions} questions</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getPerformanceColor(percentage)}`}>
                      {percentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.score}/{session.total_questions}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Quiz Review</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold">{selectedSession.topic_name}</span>
                    <span>•</span>
                    <span>{selectedSession.subject_name}</span>
                    <span>•</span>
                    <span>{format(new Date(selectedSession.completed_at), "MMM d, yyyy")}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {/* Score Summary */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">
                      {selectedSession.score}/{selectedSession.total_questions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {((selectedSession.score / selectedSession.total_questions) * 100).toFixed(0)}% - {getPerformanceLabel((selectedSession.score / selectedSession.total_questions) * 100)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions Review */}
              <div className="space-y-6">
                {selectedSession.questions.map((question: any, index: number) => {
                  const userAnswer = selectedSession.answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div key={index} className="border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Question Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 rounded-full flex-shrink-0 ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs">
                              Question {index + 1}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>
                          <div className="text-lg font-semibold text-foreground leading-relaxed">
                            {question.question}
                          </div>
                        </div>
                      </div>

                      {/* Answer Options */}
                      <div className="space-y-3 mb-4">
                        {question.options.map((option: string, optIndex: number) => {
                          const isUserAnswer = userAnswer === optIndex;
                          const isCorrectAnswer = question.correctAnswer === optIndex;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                isCorrectAnswer
                                  ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                                  : isUserAnswer
                                  ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
                                  : 'bg-muted border-border'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-bold text-base mt-0.5">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span className="flex-1 text-base">{option}</span>
                                <div className="flex gap-2">
                                  {isCorrectAnswer && (
                                    <Badge className="bg-green-600">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Correct Answer
                                    </Badge>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <Badge variant="destructive">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Your Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Explanation */}
                      <div className="mt-4 p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <h4 className="text-base font-bold text-primary">Detailed Explanation</h4>
                        </div>
                        <div className="text-base text-foreground leading-relaxed space-y-2">
                          {question.explanation}
                        </div>
                        
                        {/* Why answer is correct/incorrect */}
                        <div className="mt-4 pt-4 border-t border-primary/20">
                          {isCorrect ? (
                            <div className="flex items-start gap-2 text-green-700 dark:text-green-400">
                              <TrendingUp className="w-4 h-4 mt-1 flex-shrink-0" />
                              <p className="text-sm">
                                <strong>Great job!</strong> You correctly identified option <strong>{String.fromCharCode(65 + question.correctAnswer)}</strong> as the right answer.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-red-700 dark:text-red-400">
                                <XCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                                <p className="text-sm">
                                  You selected option <strong>{String.fromCharCode(65 + userAnswer)}</strong>, but the correct answer is option <strong>{String.fromCharCode(65 + question.correctAnswer)}</strong>.
                                </p>
                              </div>
                              <div className="flex items-start gap-2 text-primary">
                                <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0" />
                                <p className="text-sm">
                                  <strong>Remember:</strong> Review the explanation above to understand why option <strong>{String.fromCharCode(65 + question.correctAnswer)}</strong> is correct.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
