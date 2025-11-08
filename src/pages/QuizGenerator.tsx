import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, BookOpen, Brain, CheckCircle2, XCircle, Loader2, Trophy, RotateCcw } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Topic {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  difficulty: string;
}

interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

interface UserAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

export default function QuizGenerator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject.id);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('quiz_subjects')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive',
      });
      return;
    }
    
    setSubjects(data || []);
  };

  const fetchTopics = async (subjectId: string) => {
    const { data, error } = await supabase
      .from('quiz_topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('name');
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive',
      });
      return;
    }
    
    setTopics(data || []);
  };

  const generateQuiz = async (topic: Topic) => {
    setIsGenerating(true);
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

      if (data?.error) {
        throw new Error(data.error);
      }

      setQuestions(data.questions);
      setUserAnswers([]);
      setCurrentQuestionIndex(0);
      setIsSubmitted(false);
      setScore(0);
      
      toast({
        title: 'Quiz Ready!',
        description: `Generated 15 fresh questions on ${topic.name}`,
      });
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isSubmitted) return;

    const existingAnswerIndex = userAnswers.findIndex(
      (a) => a.questionIndex === currentQuestionIndex
    );

    if (existingAnswerIndex >= 0) {
      const newAnswers = [...userAnswers];
      newAnswers[existingAnswerIndex] = { questionIndex: currentQuestionIndex, selectedAnswer: answer };
      setUserAnswers(newAnswers);
    } else {
      setUserAnswers([...userAnswers, { questionIndex: currentQuestionIndex, selectedAnswer: answer }]);
    }
  };

  const handleSubmitQuiz = async () => {
    if (userAnswers.length !== 15) {
      toast({
        title: 'Incomplete Quiz',
        description: 'Please answer all questions before submitting',
        variant: 'destructive',
      });
      return;
    }

    let correctCount = 0;
    userAnswers.forEach((answer) => {
      if (answer.selectedAnswer === questions[answer.questionIndex].correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    setShowExplanation(true);

    // Save to database
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && selectedTopic) {
        await supabase.from('quiz_sessions').insert([{
          user_id: userData.user.id,
          topic_id: selectedTopic.id,
          score: correctCount,
          total_questions: 15,
          questions: questions as any,
          answers: userAnswers as any,
        }]);
      }
    } catch (error) {
      console.error('Error saving quiz session:', error);
    }

    toast({
      title: 'Quiz Completed!',
      description: `You scored ${correctCount} out of 15 (${Math.round((correctCount / 15) * 100)}%)`,
    });
  };

  const handleRetakeQuiz = () => {
    if (selectedTopic) {
      generateQuiz(selectedTopic);
    }
  };

  const getUserAnswer = (questionIndex: number) => {
    return userAnswers.find((a) => a.questionIndex === questionIndex)?.selectedAnswer;
  };

  const isAnswerCorrect = (questionIndex: number) => {
    const userAnswer = getUserAnswer(questionIndex);
    return userAnswer === questions[questionIndex].correctAnswer;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-primary';
      case 'hard': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getPerformanceRating = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent!', color: 'text-success' };
    if (percentage >= 75) return { text: 'Great Job!', color: 'text-primary' };
    if (percentage >= 60) return { text: 'Good Effort', color: 'text-secondary' };
    return { text: 'Keep Practicing', color: 'text-muted-foreground' };
  };

  // Subject selection view
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 animate-fade-in"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold mb-2 text-gradient">Quiz Generator</h1>
            <p className="text-muted-foreground">Select a subject to begin your AI-powered quiz journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <Card
                key={subject.id}
                className="p-6 cursor-pointer hover-lift transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedSubject(subject)}
              >
                <div className="text-5xl mb-4">{subject.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{subject.name}</h3>
                <p className="text-sm text-muted-foreground">{subject.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Topic selection view
  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedSubject(null);
              setSelectedTopic(null);
            }}
            className="mb-6 animate-fade-in"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subjects
          </Button>

          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{selectedSubject.icon}</span>
              <h1 className="text-4xl font-bold text-gradient">{selectedSubject.name}</h1>
            </div>
            <p className="text-muted-foreground">Choose a topic to generate a fresh quiz</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic, index) => (
              <Card
                key={topic.id}
                className="p-6 hover-lift transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold">{topic.name}</h3>
                  <span className={`text-sm font-medium ${getDifficultyColor(topic.difficulty)}`}>
                    {topic.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>
                <Button
                  onClick={() => {
                    setSelectedTopic(topic);
                    generateQuiz(topic);
                  }}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking / results view
  const currentQuestion = questions[currentQuestionIndex];
  const currentUserAnswer = getUserAnswer(currentQuestionIndex);
  const percentage = isSubmitted ? Math.round((score / 15) * 100) : 0;
  const performance = isSubmitted ? getPerformanceRating(percentage) : null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => {
            setQuestions([]);
            setSelectedTopic(null);
          }}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Topics
        </Button>

        {/* Header */}
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold mb-2">{selectedTopic?.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Question {currentQuestionIndex + 1} of 15
            </span>
            {isSubmitted && (
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                Score: {score}/15 ({percentage}%)
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in">
          <Progress value={((currentQuestionIndex + 1) / 15) * 100} className="h-2" />
        </div>

        {/* Results Summary */}
        {isSubmitted && currentQuestionIndex === 0 && (
          <Card className="p-8 mb-6 text-center animate-scale-in">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className={`text-xl mb-4 ${performance?.color}`}>{performance?.text}</p>
            <div className="text-4xl font-bold mb-6 text-gradient">
              {score} / 15
            </div>
            <p className="text-muted-foreground mb-6">
              You got {percentage}% of questions correct
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRetakeQuiz} size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake with New Questions
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(0)}
                size="lg"
              >
                Review Answers
              </Button>
            </div>
          </Card>
        )}

        {/* Question Card */}
        <Card className="p-8 mb-6 animate-scale-in">
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

          <div className="space-y-3 mb-6">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = currentUserAnswer === key;
              const isCorrect = currentQuestion.correctAnswer === key;
              const showResult = isSubmitted;

              return (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={isSubmitted}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-success bg-success/10'
                        : isSelected
                        ? 'border-destructive bg-destructive/10'
                        : 'border-border'
                      : isSelected
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary">{key}.</span>
                      <span>{value}</span>
                    </div>
                    {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isSubmitted && (
            <div className="p-4 bg-accent rounded-lg animate-fade-in">
              <div className="flex items-start gap-2 mb-2">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <h3 className="font-semibold">Explanation</h3>
              </div>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              {currentUserAnswer !== currentQuestion.correctAnswer && (
                <p className="text-sm text-destructive mt-2">
                  Correct answer: {currentQuestion.correctAnswer}. {currentQuestion.options[currentQuestion.correctAnswer as keyof typeof currentQuestion.options]}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center animate-fade-in">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          {!isSubmitted && currentQuestionIndex === 14 && userAnswers.length === 15 ? (
            <Button onClick={handleSubmitQuiz} size="lg" className="shadow-glow">
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(14, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === 14}
            >
              Next
            </Button>
          )}
        </div>

        {/* Question Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8 flex-wrap animate-fade-in">
          {questions.map((_, index) => {
            const answered = userAnswers.some((a) => a.questionIndex === index);
            const correct = isSubmitted && isAnswerCorrect(index);
            const incorrect = isSubmitted && !isAnswerCorrect(index);

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  currentQuestionIndex === index
                    ? 'bg-primary text-primary-foreground scale-110'
                    : correct
                    ? 'bg-success text-success-foreground'
                    : incorrect
                    ? 'bg-destructive text-destructive-foreground'
                    : answered
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}