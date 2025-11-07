import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Calendar, Target, TrendingUp, Sparkles, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "Intelligent Explanations",
      description: "Complex concepts explained in simple terms, adapted to your learning level"
    },
    {
      icon: Target,
      title: "Adaptive Quizzes",
      description: "AI-generated quizzes that adjust difficulty based on your performance"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Personalized study schedules that optimize your learning efficiency"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Real-time analytics to monitor improvement and identify weak areas"
    },
    {
      icon: Sparkles,
      title: "Multi-Exam Support",
      description: "Comprehensive preparation for JEE, NEET, UPSC, CAT, GATE, and more"
    },
    {
      icon: MessageSquare,
      title: "AI Study Buddy",
      description: "24/7 intelligent companion that remembers your journey and guides you"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PrepIQ</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-primary hover:opacity-90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-accent-foreground/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">AI-Powered Study Companion</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Your Intelligent Path to
            <span className="text-gradient block mt-2">Exam Success</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            PrepIQ is an autonomous AI agent that thinks, plans, and acts as your personal study companion. 
            Get personalized explanations, adaptive quizzes, and smart scheduling—all powered by advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow text-lg px-8">
                Start Learning Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 border-2">
              Watch Demo
            </Button>
          </div>

          <div className="mt-16 relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-20 h-20 text-primary mx-auto mb-4 animate-float" />
                  <p className="text-lg font-medium text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Autonomous AI That <span className="text-gradient">Actually Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              PrepIQ doesn't just answer questions—it reasons, plans, and executes real tasks to accelerate your learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How PrepIQ <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and experience the power of AI-driven learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create Your Profile", desc: "Tell us about your target exams and learning goals" },
              { step: "2", title: "AI Analyzes & Plans", desc: "Our autonomous agent creates your personalized study roadmap" },
              { step: "3", title: "Learn & Succeed", desc: "Chat with AI, take adaptive quizzes, and track your progress" }
            ].map((item, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 shadow-xl">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Transform Your <span className="text-gradient">Study Journey?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students who are acing their exams with PrepIQ's intelligent AI companion
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow text-lg px-10">
                Get Started for Free
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">No credit card required • Free forever</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PrepIQ</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 PrepIQ. Built for Agentverse Hackathon. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;