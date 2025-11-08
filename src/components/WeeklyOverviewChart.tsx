import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  type: "study" | "break" | "extracurricular" | "exam-prep";
}

interface WeeklyOverviewChartProps {
  subjects: Subject[];
  schedule: TimeSlot[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Color mapping from Tailwind classes to hex
const COLOR_MAP: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-green-500": "#22c55e",
  "bg-purple-500": "#a855f7",
  "bg-orange-500": "#f97316",
  "bg-pink-500": "#ec4899",
  "bg-yellow-500": "#eab308",
  "bg-red-500": "#ef4444",
  "bg-indigo-500": "#6366f1",
};

const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;
  return (endInMinutes - startInMinutes) / 60; // Return hours
};

export default function WeeklyOverviewChart({ subjects, schedule }: WeeklyOverviewChartProps) {
  // Calculate hours per subject per day
  const chartData = DAYS.map((day) => {
    const daySlots = schedule.filter((slot) => slot.day === day && slot.type === "study");
    const dayData: any = { day: day.slice(0, 3) }; // Abbreviate day names
    
    subjects.forEach((subject) => {
      const subjectSlots = daySlots.filter((slot) => slot.subjectId === subject.id);
      const totalHours = subjectSlots.reduce((sum, slot) => {
        return sum + calculateDuration(slot.startTime, slot.endTime);
      }, 0);
      dayData[subject.name] = totalHours;
    });
    
    return dayData;
  });

  // Calculate total hours per subject for legend ordering
  const subjectTotals = subjects.map((subject) => {
    const total = schedule
      .filter((slot) => slot.subjectId === subject.id && slot.type === "study")
      .reduce((sum, slot) => sum + calculateDuration(slot.startTime, slot.endTime), 0);
    return { ...subject, total };
  }).sort((a, b) => b.total - a.total);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded mr-2" style={{ backgroundColor: entry.fill }} />
              {entry.name}: {entry.value.toFixed(1)}h
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Weekly Study Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="day" 
              className="text-xs text-muted-foreground"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              className="text-xs text-muted-foreground"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            {subjectTotals.map((subject) => (
              <Bar
                key={subject.id}
                dataKey={subject.name}
                stackId="a"
                fill={COLOR_MAP[subject.color] || "#6366f1"}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
