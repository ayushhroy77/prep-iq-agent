import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import quizData from "@/data/quiz-data.json";
import { QuizRecommendations } from "@/components/QuizRecommendations";
import { QuizHistory } from "@/components/QuizHistory";

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
  const location = useLocation();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<5 | 15>(15);
  const [isMixedTopics, setIsMixedTopics] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const subjects = quizData.subjects as Subject[];

  // Handle auto-navigation from recommendations
  useEffect(() => {
    const state = location.state as { selectedTopicId?: string; autoStart?: boolean } | null;
    if (state?.selectedTopicId && state?.autoStart) {
      // Find the topic and subject
      for (const subject of subjects) {
        const topic = subject.topics.find((t: Topic) => t.id === state.selectedTopicId);
        if (topic) {
          setSelectedSubject(subject);
          setSelectedTopic(topic);
          break;
        }
      }
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, subjects, navigate, location.pathname]);

  const generateQuiz = async (topic: Topic, difficulty: 'easy' | 'medium' | 'hard', count: 5 | 15, mixed: boolean) => {
    setIsLoading(true);
    setShowExplanation(false);
    try {
      // Add timestamp to ensure fresh generation each time
      const timestamp = Date.now();
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          topicName: topic.name,
          topicDescription: topic.description,
          difficulty: difficulty,
          questionCount: count,
          isMixed: mixed,
          timestamp: timestamp, // Cache buster
        },
      });

      if (error) throw error;

      if (!data?.questions || !Array.isArray(data.questions) || data.questions.length !== count) {
        throw new Error('Invalid quiz data received');
      }

      setQuestions(data.questions);
      setUserAnswers(new Array(count).fill(null));
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
      generateQuiz(selectedTopic, selectedDifficulty, questionCount, isMixedTopics);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedDifficulty('medium');
    setQuestionCount(15);
    setIsMixedTopics(false);
    setQuestions([]);
    setQuizSubmitted(false);
  };

  const handleStartQuiz = () => {
    if (selectedTopic) {
      generateQuiz(selectedTopic, selectedDifficulty, questionCount, isMixedTopics);
    }
  };

  const handleMixedTopicsSelect = () => {
    if (!selectedSubject) return;
    
    // Create a mixed topic combining all topics from the subject
    const allTopicDescriptions = selectedSubject.topics.map(t => t.name).join(', ');
    const mixedTopic: Topic = {
      id: 'mixed',
      name: `${selectedSubject.name} - Mixed Topics`,
      description: `Comprehensive review covering: ${allTopicDescriptions}`,
    };
    
    setSelectedTopic(mixedTopic);
    setIsMixedTopics(true);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const score = quizSubmitted ? calculateScore() : 0;
  const percentage = quizSubmitted ? Math.round((score / questions.length) * 100) : 0;
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

          {/* Quiz Recommendations */}
          <div className="mb-8">
            <QuizRecommendations />
          </div>

          {/* Quiz History */}
          <div className="mb-8">
            <QuizHistory />
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

  // Topic Selection and Difficulty View
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
            <p className="text-muted-foreground">Choose a topic or try mixed topics for comprehensive review</p>
          </div>

          {/* Mixed Topics Option */}
          <Card
            className={`mb-6 cursor-pointer hover:shadow-lg transition-all border-2 ${
              isMixedTopics ? 'ring-2 ring-primary border-primary' : 'border-dashed'
            }`}
            onClick={() => !isLoading && handleMixedTopicsSelect()}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎯</div>
                <div className="flex-1">
                  <CardTitle className="text-xl">Mixed Topics Challenge</CardTitle>
                  <CardDescription>
                    Test your knowledge across all {selectedSubject.topics.length} topics in {selectedSubject.name}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">Comprehensive</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Individual Topics */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-3">Or select a specific topic:</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {selectedSubject.topics.map((topic) => (
              <Card
                key={topic.id}
                className={`cursor-pointer hover:shadow-lg transition-all ${
                  selectedTopic?.id === topic.id && !isMixedTopics ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  if (!isLoading) {
                    setIsMixedTopics(false);
                    handleTopicSelect(topic);
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{topic.name}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">AI-generated questions</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTopic && !isLoading && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Configure Your Quiz</CardTitle>
                <CardDescription>
                  Customize your {selectedTopic.name} quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quiz Length Selection */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Quiz Length</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        questionCount === 5 ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setQuestionCount(5)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⚡</span>
                          <div>
                            <CardTitle className="text-lg">Quick Practice</CardTitle>
                            <CardDescription>5 questions - Perfect for quick review</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        questionCount === 15 ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setQuestionCount(15)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📚</span>
                          <div>
                            <CardTitle className="text-lg">Full Quiz</CardTitle>
                            <CardDescription>15 questions - Comprehensive test</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Difficulty Level</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDifficulty === 'easy' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' : ''
                    }`}
                    onClick={() => setSelectedDifficulty('easy')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600 dark:text-green-400">Easy</CardTitle>
                      <CardDescription>
                        Basic concepts and fundamental understanding
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDifficulty === 'medium' ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''
                    }`}
                    onClick={() => setSelectedDifficulty('medium')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-yellow-600 dark:text-yellow-400">Medium</CardTitle>
                      <CardDescription>
                        Intermediate concepts and applications
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDifficulty === 'hard' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950' : ''
                    }`}
                    onClick={() => setSelectedDifficulty('hard')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600 dark:text-red-400">Hard</CardTitle>
                      <CardDescription>
                        Advanced concepts and complex problems
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                <Button onClick={handleStartQuiz} className="w-full" size="lg">
                  Start {questionCount === 5 ? 'Quick Practice' : 'Full Quiz'} ({selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)})
                </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                  Question {currentQuestionIndex + 1} of {questions.length} {questionCount === 5 ? '⚡' : '📚'}
                </p>
              </div>
            <Badge 
              variant="outline" 
              className={`text-lg px-4 py-2 ${
                selectedDifficulty === 'easy' ? 'border-green-500 text-green-600 dark:text-green-400' :
                selectedDifficulty === 'medium' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' :
                'border-red-500 text-red-600 dark:text-red-400'
              }`}
            >
              {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
            </Badge>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
        </div>

        {/* Results Summary (shown after submission) */}
        {quizSubmitted && (
          <Card className="mb-8 border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                {percentage >= 80 ? (
                  <span className="text-5xl">🎉</span>
                ) : percentage >= 60 ? (
                  <span className="text-5xl">👍</span>
                ) : (
                  <span className="text-5xl">💪</span>
                )}
              </div>
              <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">
                {selectedTopic.name} - {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-background/50">
                    <div className="text-4xl font-bold text-primary mb-1">{score}/{questions.length}</div>
                    <div className="text-sm text-muted-foreground">Correct Answers</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/50">
                    <div className="text-4xl font-bold text-primary mb-1">{percentage}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                </div>
                
                <div className="text-center p-6 rounded-lg bg-background/50 border-2 border-primary/20">
                  <div className="text-sm text-muted-foreground mb-2">Performance Rating</div>
                  <div className={`text-3xl font-bold ${rating.color}`}>
                    {rating.text}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={handleRetakeQuiz} className="w-full" size="lg">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Generate New Questions
                  </Button>
                  <Button onClick={handleBackToSubjects} variant="outline" className="w-full" size="lg">
                    Back to Topics
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                  Review all questions and explanations below to enhance your learning
                </div>
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
          <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                <BookOpen className="mr-2 h-5 w-5" />
                Detailed Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border-l-4 ${
                userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer
                  ? 'bg-green-50 dark:bg-green-950/50 border-green-500'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-500'
              }`}>
                <p className="text-foreground leading-relaxed text-base">
                  {currentQuestion.explanation}
                </p>
              </div>
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
