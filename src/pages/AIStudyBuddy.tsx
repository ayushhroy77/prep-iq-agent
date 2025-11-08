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
    <div className="min-h-screen bg-gradient-hero">
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img src={prepiqLogo} alt="PrepIQ" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold">AI Study Buddy</h1>
              <p className="text-sm text-muted-foreground">Your personal AI tutor</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="p-6 h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <img src={prepiqLogo} alt="AI" className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
                <div className={`flex flex-col gap-2 max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="max-w-full h-auto rounded-lg border-2 border-border"
                    />
                  )}
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <img src={prepiqLogo} alt="AI" className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="bg-accent rounded-lg p-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {uploadedImage && (
            <div className="mb-4 relative inline-block">
              <img
                src={uploadedImage}
                alt="To upload"
                className="max-h-32 rounded-lg border-2 border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => setUploadedImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Input Area */}
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
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a complex question or describe the problem..."
              className="flex-1 min-h-[60px] resize-none"
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
              className="bg-gradient-primary hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Explain this step by step with detailed reasoning")}
              disabled={isLoading}
            >
              Step-by-step explanation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Solve this problem and show all work")}
              disabled={isLoading}
            >
              Solve with work shown
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIStudyBuddy;
