import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Calendar, Clock, Target, Trash2, Edit, Check, BookOpen, Coffee, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface Subject {
  id: string;
  name: string;
  difficulty: string;
  priority: number;
  color: string;
}

interface Schedule {
  id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  session_type: string;
  notes: string | null;
  is_completed: boolean;
}

interface Goal {
  id: string;
  subject_id: string | null;
  goal_type: string;
  description: string | null;
  target_hours: number;
  deadline: string | null;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SESSION_TYPES = [
  { value: "study", label: "Study", icon: BookOpen },
  { value: "break", label: "Break", icon: Coffee },
  { value: "exercise", label: "Exercise", icon: Dumbbell },
];

export default function StudySchedule() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
    } else {
      setUser(user);
    }
  };

  const loadData = async () => {
    const [subjectsData, schedulesData, goalsData] = await Promise.all([
      supabase.from("subjects").select("*").order("priority", { ascending: false }),
      supabase.from("study_schedules").select("*"),
      supabase.from("study_goals").select("*"),
    ]);

    if (subjectsData.data) setSubjects(subjectsData.data);
    if (schedulesData.data) setSchedules(schedulesData.data);
    if (goalsData.data) setGoals(goalsData.data);
  };

  const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("subjects").insert({
      user_id: user.id,
      name: formData.get("name") as string,
      difficulty: formData.get("difficulty") as string,
      priority: parseInt(formData.get("priority") as string),
      color: formData.get("color") as string,
    });

    if (error) {
      toast.error("Failed to create subject");
    } else {
      toast.success("Subject created");
      setIsSubjectDialogOpen(false);
      loadData();
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("study_schedules").insert({
      user_id: user.id,
      subject_id: formData.get("subject_id") as string,
      day_of_week: parseInt(formData.get("day_of_week") as string),
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      session_type: formData.get("session_type") as string,
      notes: formData.get("notes") as string,
    });

    if (error) {
      toast.error("Failed to create schedule");
    } else {
      toast.success("Schedule created");
      setIsScheduleDialogOpen(false);
      loadData();
    }
  };

  const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("study_goals").insert({
      user_id: user.id,
      subject_id: formData.get("subject_id") as string || null,
      goal_type: formData.get("goal_type") as string,
      description: formData.get("description") as string,
      target_hours: parseInt(formData.get("target_hours") as string),
      deadline: formData.get("deadline") as string || null,
    });

    if (error) {
      toast.error("Failed to create goal");
    } else {
      toast.success("Goal created");
      setIsGoalDialogOpen(false);
      loadData();
    }
  };

  const handleToggleComplete = async (scheduleId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from("study_schedules")
      .update({ is_completed: !isCompleted })
      .eq("id", scheduleId);

    if (error) {
      toast.error("Failed to update schedule");
    } else {
      loadData();
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    const { error } = await supabase.from("study_schedules").delete().eq("id", scheduleId);

    if (error) {
      toast.error("Failed to delete schedule");
    } else {
      toast.success("Schedule deleted");
      loadData();
    }
  };

  const getDaySchedules = (day: number) => {
    return schedules
      .filter((s) => s.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const calculateWeeklyProgress = () => {
    const completed = schedules.filter((s) => s.is_completed).length;
    const total = schedules.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getSmartSuggestions = () => {
    const suggestions = [];
    
    // Suggest breaks if too many consecutive study sessions
    const todaySchedules = getDaySchedules(selectedDay);
    const consecutiveStudy = todaySchedules.filter((s, i, arr) => {
      if (i === 0) return false;
      return s.session_type === "study" && arr[i - 1].session_type === "study";
    });
    
    if (consecutiveStudy.length > 2) {
      suggestions.push("Consider adding breaks between study sessions for better focus");
    }

    // Suggest prioritizing high-priority subjects
    const highPrioritySubjects = subjects.filter((s) => s.priority > 3);
    const scheduledHighPriority = schedules.filter((sch) => {
      const subject = getSubjectById(sch.subject_id);
      return subject && subject.priority > 3;
    });

    if (highPrioritySubjects.length > scheduledHighPriority.length) {
      suggestions.push("Schedule more time for high-priority subjects");
    }

    // Suggest exercise if none scheduled
    const hasExercise = schedules.some((s) => s.session_type === "exercise");
    if (!hasExercise) {
      suggestions.push("Add exercise sessions for better productivity");
    }

    return suggestions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Smart Study Schedule
            </h1>
            <p className="text-muted-foreground mt-2">
              Personalize your timetable based on goals and priorities
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Subject</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Subject Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select name="difficulty" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority (1-5)</Label>
                    <Input id="priority" name="priority" type="number" min="1" max="5" defaultValue="3" required />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" name="color" type="color" defaultValue="#6366f1" required />
                  </div>
                  <Button type="submit" className="w-full">Create</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Study Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSchedule} className="space-y-4">
                  <div>
                    <Label htmlFor="subject_id">Subject</Label>
                    <Select name="subject_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="day_of_week">Day</Label>
                    <Select name="day_of_week" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input id="start_time" name="start_time" type="time" required />
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Time</Label>
                      <Input id="end_time" name="end_time" type="time" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="session_type">Session Type</Label>
                    <Select name="session_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Optional notes..." />
                  </div>
                  <Button type="submit" className="w-full">Add Session</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="mr-2 h-4 w-4" /> Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <div>
                    <Label htmlFor="goal_subject_id">Subject (Optional)</Label>
                    <Select name="subject_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goal_type">Goal Type</Label>
                    <Select name="goal_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="exam">Exam Preparation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Describe your goal..." />
                  </div>
                  <div>
                    <Label htmlFor="target_hours">Target Hours</Label>
                    <Input id="target_hours" name="target_hours" type="number" min="1" required />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" name="deadline" type="date" />
                  </div>
                  <Button type="submit" className="w-full">Create Goal</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <Progress value={calculateWeeklyProgress()} className="flex-1" />
                <span className="text-sm font-medium">{Math.round(calculateWeeklyProgress())}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                <TabsList className="grid grid-cols-7 w-full">
                  {DAYS.map((day, idx) => (
                    <TabsTrigger key={idx} value={idx.toString()}>
                      {day.substring(0, 3)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {DAYS.map((day, idx) => (
                  <TabsContent key={idx} value={idx.toString()} className="space-y-3 mt-4">
                    {getDaySchedules(idx).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No sessions scheduled for {day}
                      </div>
                    ) : (
                      getDaySchedules(idx).map((schedule) => {
                        const subject = getSubjectById(schedule.subject_id);
                        const SessionIcon = SESSION_TYPES.find((t) => t.value === schedule.session_type)?.icon || Clock;
                        
                        return (
                          <Card
                            key={schedule.id}
                            className={`border-l-4 transition-all hover:shadow-md ${
                              schedule.is_completed ? "opacity-60" : ""
                            }`}
                            style={{ borderLeftColor: subject?.color || "#6366f1" }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <SessionIcon className="h-4 w-4" />
                                    <span className="font-semibold">{subject?.name || "Unknown"}</span>
                                    <Badge variant="outline">{schedule.session_type}</Badge>
                                    {schedule.is_completed && (
                                      <Badge variant="default" className="bg-green-500">
                                        <Check className="h-3 w-3 mr-1" />
                                        Done
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {schedule.start_time} - {schedule.end_time}
                                    </span>
                                  </div>
                                  {schedule.notes && (
                                    <p className="text-sm mt-2 text-muted-foreground">{schedule.notes}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleToggleComplete(schedule.id, schedule.is_completed)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {subjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No subjects yet. Create one to get started!
                  </p>
                ) : (
                  subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ borderLeftColor: subject.color, borderLeftWidth: "4px" }}
                    >
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{subject.difficulty}</p>
                      </div>
                      <Badge variant="secondary">Priority: {subject.priority}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Study Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {goals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No goals set. Create one to track your progress!
                  </p>
                ) : (
                  goals.map((goal) => (
                    <div key={goal.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge>{goal.goal_type}</Badge>
                        <span className="text-sm font-medium">{goal.target_hours}h</span>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Smart Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getSmartSuggestions().map((suggestion, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
