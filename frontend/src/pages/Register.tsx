import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle2, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import prepiqLogo from "@/assets/prepiq-logo.jpg";
import studyBackground from "@/assets/study-background.jpg";
import { z } from "zod";

// Validation schema
const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().or(z.literal("")),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  targetExams: z.array(z.string()).min(1, "Select at least one target exam").max(10, "Maximum 10 exams allowed"),
  educationLevel: z.enum(["High School", "Undergraduate", "Graduate", "Working Professional"], {
    errorMap: () => ({ message: "Please select an education level" })
  }),
  language: z.enum(["English", "Hindi", "Tamil", "Telugu", "Bengali"], {
    errorMap: () => ({ message: "Please select a preferred language" })
  }),
  agreeTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data with zod
    try {
      registerSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone_number: formData.phone.trim() || null,
            target_exams: formData.targetExams,
            education_level: formData.educationLevel,
            preferred_language: formData.language,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful!",
          description: "Welcome to PrepIQ - redirecting to dashboard...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${studyBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <Card className="w-full max-w-2xl p-8 sm:p-12 space-y-8 animate-fade-in glass-card relative z-10">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={prepiqLogo} alt="PrepIQ Logo" className="w-12 h-12 rounded-lg" />
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
                <label
                  key={exam}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.targetExams.includes(exam)
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <Checkbox
                    checked={formData.targetExams.includes(exam)}
                    onCheckedChange={() => handleExamToggle(exam)}
                    className="pointer-events-auto"
                  />
                  <span className="text-sm font-medium">{exam}</span>
                </label>
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
              <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </Label>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {loading ? "Creating Account..." : "Create Account"}
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