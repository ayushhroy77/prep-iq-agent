import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Brain, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    targetExams: [] as string[],
    educationLevel: "",
    language: "",
    agreeTerms: false
  });

  const exams = ["JEE Main/Advanced", "NEET", "UPSC", "CAT", "GATE", "Other"];
  const educationLevels = ["High School", "Undergraduate", "Graduate", "Working Professional"];
  const languages = ["English", "Hindi", "Tamil", "Telugu", "Bengali"];

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 1, text: "Weak", color: "bg-destructive" },
      { strength: 2, text: "Fair", color: "bg-yellow-500" },
      { strength: 3, text: "Good", color: "bg-blue-500" },
      { strength: 4, text: "Strong", color: "bg-success" }
    ];

    return levels[strength - 1] || { strength: 0, text: "", color: "" };
  };

  const handleExamToggle = (exam: string) => {
    setFormData(prev => ({
      ...prev,
      targetExams: prev.targetExams.includes(exam)
        ? prev.targetExams.filter(e => e !== exam)
        : [...prev.targetExams, exam]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive"
      });
      return;
    }

    if (formData.targetExams.length === 0) {
      toast({
        title: "Select Target Exam",
        description: "Please select at least one target exam",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Registration Successful!",
      description: "Welcome to PrepIQ. Redirecting to dashboard...",
    });

    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl p-8 sm:p-12 space-y-8 animate-fade-in glass-card">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">PrepIQ</span>
          </Link>
          <h2 className="text-3xl font-bold mb-2">Create Your Account</h2>
          <p className="text-muted-foreground">Start your journey to exam success with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="h-12"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 12345 67890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-12"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= passwordStrength.strength ? passwordStrength.color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength: {passwordStrength.text}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Target Exams */}
          <div className="space-y-3">
            <Label>Target Exam(s) *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {exams.map((exam) => (
                <div
                  key={exam}
                  onClick={() => handleExamToggle(exam)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.targetExams.includes(exam)
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={formData.targetExams.includes(exam)}
                    onCheckedChange={() => handleExamToggle(exam)}
                  />
                  <span className="text-sm font-medium">{exam}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Education Level & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="educationLevel">Education Level *</Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}
                required
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
                required
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, agreeTerms: checked as boolean })
              }
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              I agree to PrepIQ's{" "}
              <a href="#" className="text-primary hover:underline">Terms & Conditions</a>
              {" "}and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </Label>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Create Account
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Register;