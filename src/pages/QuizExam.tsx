import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Bookmark,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuizConfig } from "./QuizGenerator";
import { supabase } from "@/integrations/supabase/client";

interface QuizExamProps {
  config: QuizConfig;
  onSubmitQuiz: (results: any) => void;
}

type QuestionStatus = "unattempted" | "attempted" | "marked";

const QuizExam = ({ config, onSubmitQuiz }: QuizExamProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>(
    Array(config.questions.length).fill("unattempted")
  );
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [timeLeft, setTimeLeft] = useState(config.time_limit_minutes * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [userId, setUserId] = useState("");
  const warningShownRef = useRef(false);

  useEffect(() => {
    // Get user ID
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.email || session.user.id);
      }
    });

    // Load saved answers from session storage
    const savedAnswers = sessionStorage.getItem(`quiz_${config.quiz_id}`);
    if (savedAnswers) {
      const parsed = JSON.parse(savedAnswers);
      setAnswers(parsed.answers || {});
      setBookmarkedQuestions(new Set(parsed.bookmarks || []));
    }
  }, [config.quiz_id]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }

        // Show warning at 5 minutes
        if (prev === 300 && !warningShownRef.current) {
          warningShownRef.current = true;
          setShowWarningDialog(true);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save answers to session storage
  useEffect(() => {
    sessionStorage.setItem(
      `quiz_${config.quiz_id}`,
      JSON.stringify({
        answers,
        bookmarks: Array.from(bookmarkedQuestions),
      })
    );
  }, [answers, bookmarkedQuestions, config.quiz_id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }));

    // Update status to attempted
    setQuestionStatuses((prev) => {
      const newStatuses = [...prev];
      if (newStatuses[currentQuestion] !== "marked") {
        newStatuses[currentQuestion] = "attempted";
      }
      return newStatuses;
    });
  };

  const handleMarkForReview = () => {
    setQuestionStatuses((prev) => {
      const newStatuses = [...prev];
      newStatuses[currentQuestion] = "marked";
      return newStatuses;
    });
    toast({
      title: "Marked for Review",
      description: `Question ${currentQuestion + 1} marked for review`,
    });
  };

  const toggleBookmark = () => {
    setBookmarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
        toast({
          title: "Bookmark Removed",
          description: `Question ${currentQuestion + 1} bookmark removed`,
        });
      } else {
        newSet.add(currentQuestion);
        toast({
          title: "Bookmarked",
          description: `Question ${currentQuestion + 1} bookmarked`,
        });
      }
      return newSet;
    });
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < config.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleAutoSubmit = () => {
    toast({
      title: "Time's Up!",
      description: "Your quiz has been automatically submitted",
    });
    submitQuiz();
  };

  const submitQuiz = async () => {
    try {
      const timeTaken = config.time_limit_minutes * 60 - timeLeft;

      // Prepare correct answers map
      const correctAnswers: { [key: string]: string } = {};
      config.questions.forEach((q, idx) => {
        correctAnswers[(idx + 1).toString()] = q.answer;
      });

      // Convert answers to 1-indexed
      const submittedAnswers: { [key: string]: string } = {};
      Object.keys(answers).forEach((key) => {
        submittedAnswers[(parseInt(key) + 1).toString()] = answers[parseInt(key)];
      });

      const backendUrl = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: config.quiz_id,
          user_id: userId,
          subject: config.subject,
          module: config.module,
          exam_format: config.exam_format,
          difficulty: config.difficulty,
          total_questions: config.questions.length,
          answers: submittedAnswers,
          bookmarked_questions: Array.from(bookmarkedQuestions).map(i => i + 1),
          time_taken_seconds: timeTaken,
          correct_answers: correctAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const results = await response.json();

      // Enhance results with full question data
      const enhancedResults = {
        ...results,
        questions: config.questions,
        user_answers: answers,
        bookmarked: bookmarkedQuestions,
      };

      // Clear session storage
      sessionStorage.removeItem(`quiz_${config.quiz_id}`);

      // Save bookmarked questions to database
      if (bookmarkedQuestions.size > 0) {
        for (const idx of Array.from(bookmarkedQuestions)) {
          const question = config.questions[idx];
          await fetch(`${backendUrl}/api/quiz/bookmark`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              question: question.question,
              options: question.options,
              correct_answer: question.answer,
              subject: config.subject,
              module: config.module,
            }),
          });
        }
      }

      onSubmitQuiz(enhancedResults);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case "attempted":
        return "bg-blue-500 hover:bg-blue-600";
      case "marked":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-muted hover:bg-muted/80";
    }
  };

  const currentQuestionData = config.questions[currentQuestion];

  const attemptedCount = questionStatuses.filter(
    (s) => s === "attempted" || s === "marked"
  ).length;
  const markedCount = questionStatuses.filter((s) => s === "marked").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {config.subject} - {config.module}
            </h1>
            <p className="text-sm text-muted-foreground">
              {config.exam_format} ({config.difficulty})
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                timeLeft < 300
                  ? "bg-destructive/20 text-destructive"
                  : "bg-primary/20 text-primary"
              }`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              variant="default"
              className="bg-gradient-primary"
            >
              Submit Test
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Card className="max-w-4xl mx-auto p-8">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                    Question {currentQuestion + 1} of {config.questions.length}
                  </span>
                  {bookmarkedQuestions.has(currentQuestion) && (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-600 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Bookmark className="w-3 h-3 fill-current" />
                      Bookmarked
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold leading-relaxed">
                  {currentQuestionData.question}
                </h2>
              </div>
            </div>

            {/* Options */}
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={handleAnswerChange}
              className="space-y-4"
            >
              {currentQuestionData.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    answers[currentQuestion] === option
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleAnswerChange(option)}
                >
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label
                    htmlFor={`option-${idx}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    <span className="font-semibold mr-2">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  onClick={handleMarkForReview}
                  variant="outline"
                  className="gap-2"
                >
                  <Flag className="w-4 h-4" />
                  Mark for Review
                </Button>
                <Button
                  onClick={toggleBookmark}
                  variant="outline"
                  className={`gap-2 ${
                    bookmarkedQuestions.has(currentQuestion)
                      ? "bg-amber-500/20 border-amber-500"
                      : ""
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      bookmarkedQuestions.has(currentQuestion)
                        ? "fill-current text-amber-600"
                        : ""
                    }`}
                  />
                  {bookmarkedQuestions.has(currentQuestion)
                    ? "Bookmarked"
                    : "Bookmark"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestion === config.questions.length - 1}
                  className="gap-2 bg-gradient-primary"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Panel */}
        <aside className="w-80 border-l border-border bg-card p-6 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Question Navigator</h3>

          {/* Status Summary */}
          <div className="space-y-2 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Attempted:</span>
              <span className="font-semibold">{attemptedCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Marked:</span>
              <span className="font-semibold text-purple-600">{markedCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Unattempted:</span>
              <span className="font-semibold text-muted-foreground">
                {config.questions.length - attemptedCount}
              </span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {config.questions.map((_, idx) => (
              <Button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                variant="outline"
                className={`h-10 w-10 p-0 ${getStatusColor(
                  questionStatuses[idx]
                )} ${
                  currentQuestion === idx
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                } ${
                  questionStatuses[idx] !== "unattempted"
                    ? "text-white hover:text-white"
                    : ""
                }`}
              >
                {idx + 1}
              </Button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold mb-2">Legend:</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <span>Unattempted</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Attempted</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Marked for Review</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your quiz? You have attempted{" "}
              {attemptedCount} out of {config.questions.length} questions.
              {attemptedCount < config.questions.length && (
                <span className="block mt-2 text-destructive font-semibold">
                  Warning: {config.questions.length - attemptedCount} questions
                  are still unattempted!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitQuiz}>
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Time Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have only 5 minutes remaining! The quiz will auto-submit when
              time runs out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarningDialog(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizExam;
