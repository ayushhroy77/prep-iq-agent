import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, Upload, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import prepiqLogo from "@/assets/prepiq-logo.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const AIStudyBuddy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI Study Buddy. I can help you solve complex problems, analyze images, and provide detailed step-by-step explanations. Upload an image or ask me a question!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() && !uploadedImage) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim() || "Please analyze this image and provide a detailed explanation.",
      image: uploadedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    const currentImage = uploadedImage;
    setUploadedImage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: {
          messages: [
            {
              role: "system",
              content: "You are an expert AI tutor specializing in detailed, step-by-step problem solving. When analyzing questions or images, provide comprehensive explanations with clear reasoning at each step. Break down complex problems into manageable parts and explain the logic behind each solution step."
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              ...(msg.image && { image: msg.image })
            })),
            {
              role: "user",
              content: userMessage.content,
              ...(currentImage && { image: currentImage })
            }
          ]
        }
      });

      if (error) throw error;

      if (data?.response) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.response
        }]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Study-themed icons scattered in background */}
        <div className="absolute top-32 left-1/4 text-primary/5 text-6xl">📚</div>
        <div className="absolute top-1/3 right-1/4 text-primary/5 text-5xl">🎓</div>
        <div className="absolute bottom-1/4 left-1/3 text-primary/5 text-4xl">✏️</div>
        <div className="absolute top-2/3 right-1/3 text-primary/5 text-5xl">💡</div>
        <div className="absolute bottom-32 left-1/2 text-primary/5 text-4xl">📝</div>
      </div>

      <div className="container max-w-5xl mx-auto p-4 md:p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/10 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={prepiqLogo} alt="PrepIQ" className="w-12 h-12 rounded-full ring-2 ring-primary/20" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">AI Study Buddy</h1>
                <p className="text-sm text-muted-foreground">Your personal AI tutor, always ready to help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-xl bg-card/50 border-border/50 shadow-2xl">
            <div className="p-6 h-[calc(100vh-220px)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 animate-fade-in ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <img src={prepiqLogo} alt="AI" className="w-10 h-10 rounded-full ring-2 ring-primary/20" />
                      </div>
                    )}
                    <div className={`flex flex-col gap-2 max-w-[75%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Uploaded"
                          className="max-w-full h-auto rounded-xl border border-border shadow-lg"
                        />
                      )}
                      <div
                        className={`rounded-2xl p-4 transition-all duration-300 ${
                          message.role === "user"
                            ? "bg-gradient-primary text-white shadow-lg"
                            : "bg-muted/50 text-foreground backdrop-blur-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex-shrink-0">
                      <img src={prepiqLogo} alt="AI" className="w-10 h-10 rounded-full ring-2 ring-primary/20" />
                    </div>
                    <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview */}
              {uploadedImage && (
                <div className="mb-4 relative inline-block animate-scale-in">
                  <img
                    src={uploadedImage}
                    alt="To upload"
                    className="max-h-32 rounded-xl border border-border shadow-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg hover:scale-110 transition-transform"
                    onClick={() => setUploadedImage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything... Type @ for mentions"
                    className="flex-1 min-h-[60px] resize-none rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || (!input.trim() && !uploadedImage)}
                    className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Explain this step by step with detailed reasoning")}
                    disabled={isLoading}
                    className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    📖 Step-by-step
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Solve this problem and show all work")}
                    disabled={isLoading}
                    className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    ✍️ Show work
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Summarize the key concepts")}
                    disabled={isLoading}
                    className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    📝 Summarize
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Create practice questions on this topic")}
                    disabled={isLoading}
                    className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    🎯 Practice
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIStudyBuddy;
