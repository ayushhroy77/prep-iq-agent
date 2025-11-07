import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Calendar, Target, TrendingUp, Sparkles, MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";
import prepiqLogo from "@/assets/prepiq-logo.jpg";
import studyBackground from "@/assets/study-background.jpg";
import dashboardPreview from "@/assets/dashboard-preview.jpg";
import stepProfile from "@/assets/step-profile.jpg";
import stepAnalyze from "@/assets/step-analyze.jpg";
import stepSucceed from "@/assets/step-succeed.jpg";
import student1 from "@/assets/student-1.jpg";
import student2 from "@/assets/student-2.jpg";
import student3 from "@/assets/student-3.jpg";
import featureExplanations from "@/assets/feature-explanations.jpg";
import featureQuizzes from "@/assets/feature-quizzes.jpg";
import featureScheduling from "@/assets/feature-scheduling.jpg";
import featureTracking from "@/assets/feature-tracking.jpg";
import featureExams from "@/assets/feature-exams.jpg";
import featureBuddy from "@/assets/feature-buddy.jpg";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      image: featureExplanations,
      title: "Intelligent Explanations",
      description: "Complex concepts explained in simple terms, adapted to your learning level"
    },
    {
      icon: Target,
      image: featureQuizzes,
      title: "Adaptive Quizzes",
      description: "AI-generated quizzes that adjust difficulty based on your performance"
    },
    {
      icon: Calendar,
      image: featureScheduling,
      title: "Smart Scheduling",
      description: "Personalized study schedules that optimize your learning efficiency"
    },
    {
      icon: TrendingUp,
      image: featureTracking,
      title: "Progress Tracking",
      description: "Real-time analytics to monitor improvement and identify weak areas"
    },
    {
      icon: Sparkles,
      image: featureExams,
      title: "Multi-Exam Support",
      description: "Comprehensive preparation for JEE, NEET, UPSC, CAT, GATE, and more"
    },
    {
      icon: MessageSquare,
      image: featureBuddy,
      title: "AI Study Buddy",
      description: "24/7 intelligent companion that remembers your journey and guides you"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      exam: "JEE Aspirant",
      image: student1,
      rating: 5,
      text: "PrepIQ's AI explanations made complex physics concepts so easy to understand. My mock test scores improved by 40% in just 2 months!"
    },
    {
      name: "Rahul Verma",
      exam: "NEET Preparation",
      image: student2,
      rating: 5,
      text: "The adaptive quizzes are game-changing! They focus exactly on my weak areas. I feel so much more confident now."
    },
    {
      name: "Ananya Patel",
      exam: "CAT 2024",
      image: student3,
      rating: 5,
      text: "Having an AI study buddy that remembers my progress and motivates me 24/7 has been incredible. Best study companion ever!"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src={prepiqLogo} alt="PrepIQ Logo" className="w-10 h-10 rounded-lg" />
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${studyBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
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
          </div>

          <div className="mt-16 relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="glass-card rounded-2xl p-4 max-w-5xl mx-auto shadow-xl">
              <img 
                src={dashboardPreview} 
                alt="PrepIQ Dashboard Preview" 
                className="rounded-xl w-full h-auto"
              />
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
                className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
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
              { image: stepProfile, title: "Create Your Profile", desc: "Tell us about your target exams and learning goals" },
              { image: stepAnalyze, title: "AI Analyzes & Plans", desc: "Our autonomous agent creates your personalized study roadmap" },
              { image: stepSucceed, title: "Learn & Succeed", desc: "Chat with AI, take adaptive quizzes, and track your progress" }
            ].map((item, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-6 shadow-glow">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Loved by <span className="text-gradient">Thousands of Students</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what students are saying about their PrepIQ experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-8 bg-card border-border animate-fade-in hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.exam}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
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
              <img src={prepiqLogo} alt="PrepIQ Logo" className="w-10 h-10 rounded-lg" />
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