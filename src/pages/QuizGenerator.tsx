import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import quizData from "@/data/quiz-data.json";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  topics: Topic[];
}

const QuizGenerator = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const subjects = quizData.subjects as Subject[];

  const generateQuiz = async (topic: Topic) => {
    setIsLoading(true);
    setShowExplanation(false);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          topicName: topic.name,
          topicDescription: topic.description,
          difficulty: topic.difficulty,
        },
      });

      if (error) throw error;

      if (!data?.questions || !Array.isArray(data.questions) || data.questions.length !== 15) {
        throw new Error('Invalid quiz data received');
      }

      setQuestions(data.questions);
      setUserAnswers(new Array(15).fill(null));
      setCurrentQuestionIndex(0);
      setQuizSubmitted(false);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    generateQuiz(topic);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = () => {
    const unanswered = userAnswers.filter(a => a === null).length;
    if (unanswered > 0) {
      toast.error(`Please answer all questions (${unanswered} remaining)`);
      return;
    }
    setQuizSubmitted(true);
    setShowExplanation(true);
    toast.success('Quiz submitted! Review your answers below.');
  };

  const calculateScore = () => {
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getPerformanceRating = (percentage: number) => {
    if (percentage >= 90) return { text: "Outstanding!", color: "text-green-500" };
    if (percentage >= 80) return { text: "Excellent!", color: "text-blue-500" };
    if (percentage >= 70) return { text: "Good Job!", color: "text-yellow-500" };
    if (percentage >= 60) return { text: "Fair", color: "text-orange-500" };
    return { text: "Keep Practicing", color: "text-red-500" };
  };

  const handleRetakeQuiz = () => {
    if (selectedTopic) {
      generateQuiz(selectedTopic);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setQuestions([]);
    setQuizSubmitted(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const score = quizSubmitted ? calculateScore() : 0;
  const percentage = quizSubmitted ? Math.round((score / 15) * 100) : 0;
  const rating = getPerformanceRating(percentage);

  // Subject Selection View
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Quiz Generator</h1>
            <p className="text-muted-foreground">
              Select a subject to start your personalized quiz journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card
                key={subject.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedSubject(subject)}
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{subject.icon}</div>
                  <CardTitle>{subject.name}</CardTitle>
                  <CardDescription>{subject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {subject.topics.length} topics available
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Topic Selection View
  if (!selectedTopic || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={handleBackToSubjects}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subjects
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{selectedSubject.name}</h1>
            <p className="text-muted-foreground">Choose a topic to begin your quiz</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedSubject.topics.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => !isLoading && handleTopicSelect(topic)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{topic.name}</CardTitle>
                    <Badge variant={
                      topic.difficulty === 'easy' ? 'default' :
                      topic.difficulty === 'medium' ? 'secondary' :
                      'destructive'
                    }>
                      {topic.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">15 AI-generated questions</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {isLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Generating Quiz...</CardTitle>
                  <CardDescription>
                    AI is researching and creating unique questions for you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={undefined} className="w-full" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={handleBackToSubjects}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Topics
        </Button>

        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{selectedTopic.name}</h2>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {selectedTopic.difficulty}
            </Badge>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
        </div>

        {/* Results Summary (shown after submission) */}
        {quizSubmitted && (
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg">Your Score:</span>
                  <span className="text-3xl font-bold">{score} / 15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg">Percentage:</span>
                  <span className="text-2xl font-semibold">{percentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg">Performance:</span>
                  <span className={`text-2xl font-semibold ${rating.color}`}>
                    {rating.text}
                  </span>
                </div>
                <Button onClick={handleRetakeQuiz} className="w-full" size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Quiz with New Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = userAnswers[currentQuestionIndex] === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showAnswer = quizSubmitted;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={quizSubmitted}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showAnswer
                      ? isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : isSelected
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : 'border-border'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option}</span>
                    {showAnswer && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                    )}
                    {showAnswer && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500 ml-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Explanation (shown after submission) */}
        {quizSubmitted && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                <BookOpen className="mr-2 h-5 w-5" />
                Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-900 dark:text-blue-100 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1"
          >
            Previous
          </Button>

          {!quizSubmitted ? (
            currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} className="flex-1" size="lg">
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={userAnswers[currentQuestionIndex] === null}
                className="flex-1"
              >
                Next
              </Button>
            )
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex-1"
            >
              Next
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8">
          <h3 className="text-sm font-medium mb-3">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => {
              const isAnswered = userAnswers[index] !== null;
              const isCurrent = index === currentQuestionIndex;
              const isCorrect = quizSubmitted && userAnswers[index] === questions[index].correctAnswer;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary text-primary-foreground'
                      : quizSubmitted
                      ? isCorrect
                        ? 'border-green-500 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                        : 'border-red-500 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      : isAnswered
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
