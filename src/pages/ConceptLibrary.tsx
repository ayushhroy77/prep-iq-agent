import { useState } from "react";
import { ExternalLink, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import modulesData from "@/data/modules.json";

type Subject = "Physics" | "Chemistry" | "Biology" | "Mathematics";

const ConceptLibrary = () => {
  const [activeSubject, setActiveSubject] = useState<Subject>("Physics");

  const subjects: Subject[] = ["Physics", "Chemistry", "Biology", "Mathematics"];

  const handleModuleClick = (videoUrl: string) => {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Concept Library
          </h1>
          <p className="text-muted-foreground">
            Explore educational videos organized by subject and topic
          </p>
        </div>

        <Tabs value={activeSubject} onValueChange={(value) => setActiveSubject(value as Subject)}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            {subjects.map((subject) => (
              <TabsTrigger key={subject} value={subject}>
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => (
            <TabsContent key={subject} value={subject} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(modulesData[subject]).map(([title, url]) => (
                  <Card
                    key={title}
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50"
                    onClick={() => handleModuleClick(url)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start justify-between gap-2">
                        <span className="line-clamp-2">{title}</span>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>Click to watch video tutorial</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span>YouTube Video</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ConceptLibrary;
