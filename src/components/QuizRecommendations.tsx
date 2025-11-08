import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, Target, Brain, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface TopicPerformance {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  total_attempts: number;
  average_score: number;
  last_attempt: string;
}

export const QuizRecommendations = () => {
  const [weakAreas, setWeakAreas] = useState<TopicPerformance[]>([]);
  const [strongAreas, setStrongAreas] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cast supabase to any to bypass type issues
      const db = supabase as any;

      // Fetch all quiz sessions for the user
      const sessionsResponse = await db
        .from('quiz_sessions')
        .select('topic_id, score, total_questions, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (sessionsResponse.error) throw sessionsResponse.error;
      const sessions = sessionsResponse.data;

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

      // Process performance data
      const performanceMap = new Map<string, {
        topic_id: string;
        topic_name: string;
        subject_name: string;
        scores: number[];
        last_attempt: string;
      }>();

      sessions?.forEach((session: any) => {
        const topicId = session.topic_id;
        const percentage = (session.score / session.total_questions) * 100;
        const topic: any = topicMap.get(topicId);
        const topicName = topic?.name || 'Unknown Topic';
        const subjectName = topic ? (subjectMap.get(topic.subject_id) as any) || 'Unknown Subject' : 'Unknown Subject';

        if (!performanceMap.has(topicId)) {
          performanceMap.set(topicId, {
            topic_id: topicId,
            topic_name: topicName,
            subject_name: subjectName as string,
            scores: [],
            last_attempt: session.completed_at,
          });
        }

        const existing = performanceMap.get(topicId)!;
        existing.scores.push(percentage);
      });

      // Calculate averages and categorize
      const performance: TopicPerformance[] = Array.from(performanceMap.values()).map(item => ({
        topic_id: item.topic_id,
        topic_name: item.topic_name,
        subject_name: item.subject_name,
        total_attempts: item.scores.length,
        average_score: item.scores.reduce((a, b) => a + b, 0) / item.scores.length,
        last_attempt: item.last_attempt,
      }));

      // Separate weak and strong areas
      const weak = performance.filter(p => p.average_score < 70).sort((a, b) => a.average_score - b.average_score).slice(0, 3);
      const strong = performance.filter(p => p.average_score >= 85).sort((a, b) => b.average_score - a.average_score).slice(0, 3);

      setWeakAreas(weak);
      setStrongAreas(strong);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePractice = (topicId: string) => {
    navigate('/quiz-generator', { state: { selectedTopicId: topicId, autoStart: true } });
  };

  if (loading) {
    return (
      <div className="grid gap-6">
        <Card className="p-6 animate-pulse">
          <div className="h-32 bg-muted rounded"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Weak Areas - Need Attention */}
      {weakAreas.length > 0 && (
        <Card className="p-6 border-destructive/50 bg-gradient-to-br from-destructive/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">Areas Needing Attention</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            These topics need more practice to improve your performance
          </p>
          <div className="space-y-3">
            {weakAreas.map((area) => (
              <div
                key={area.topic_id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-destructive/50 transition-all"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{area.topic_name}</h4>
                  <p className="text-sm text-muted-foreground">{area.subject_name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Avg Score: <span className="text-destructive font-semibold">{area.average_score.toFixed(1)}%</span></span>
                    <span>•</span>
                    <span>{area.total_attempts} attempts</span>
                  </div>
                </div>
                <Button
                  onClick={() => handlePractice(area.topic_id)}
                  size="sm"
                  variant="destructive"
                  className="ml-4"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Practice Now
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strong Areas - Maintain Performance */}
      {strongAreas.length > 0 && (
        <Card className="p-6 border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Strong Areas</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Keep up the great work! Practice to maintain your excellent performance
          </p>
          <div className="space-y-3">
            {strongAreas.map((area) => (
              <div
                key={area.topic_id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{area.topic_name}</h4>
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{area.subject_name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Avg Score: <span className="text-primary font-semibold">{area.average_score.toFixed(1)}%</span></span>
                    <span>•</span>
                    <span>{area.total_attempts} attempts</span>
                  </div>
                </div>
                <Button
                  onClick={() => handlePractice(area.topic_id)}
                  size="sm"
                  variant="outline"
                  className="ml-4"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No data yet */}
      {weakAreas.length === 0 && strongAreas.length === 0 && (
        <Card className="p-8 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Quiz History Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Take a few quizzes to get personalized recommendations
          </p>
          <Button onClick={() => navigate('/quiz-generator')}>
            Start Your First Quiz
          </Button>
        </Card>
      )}
    </div>
  );
};
