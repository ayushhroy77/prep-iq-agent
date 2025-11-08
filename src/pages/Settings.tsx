import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Palette,
  Shield,
  Lock,
  Cloud,
  Download,
  Info,
  LogOut,
  Bell,
  Globe,
  Moon,
  HelpCircle,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Check,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SettingsSection = 
  | "overview"
  | "theme"
  | "privacy"
  | "security"
  | "backup"
  | "download"
  | "notifications"
  | "language"
  | "help"
  | "about";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<SettingsSection>("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Theme settings
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [viewMode, setViewMode] = useState("comfortable");
  
  // Privacy settings
  const [dataSharing, setDataSharing] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState(true);
  const [accountVisibility, setAccountVisibility] = useState("private");
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  // Backup settings
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("weekly");
  const [cloudProvider, setCloudProvider] = useState("none");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  
  // Alert notification preferences
  const [ntaUpdatesEmail, setNtaUpdatesEmail] = useState(true);
  const [ntaUpdatesPush, setNtaUpdatesPush] = useState(true);
  const [ntaUpdatesInApp, setNtaUpdatesInApp] = useState(true);
  
  const [examNotifEmail, setExamNotifEmail] = useState(true);
  const [examNotifPush, setExamNotifPush] = useState(true);
  const [examNotifInApp, setExamNotifInApp] = useState(true);
  
  const [scheduleRemindersEmail, setScheduleRemindersEmail] = useState(true);
  const [scheduleRemindersPush, setScheduleRemindersPush] = useState(false);
  const [scheduleRemindersInApp, setScheduleRemindersInApp] = useState(true);
  
  const [quizResultsEmail, setQuizResultsEmail] = useState(false);
  const [quizResultsPush, setQuizResultsPush] = useState(true);
  const [quizResultsInApp, setQuizResultsInApp] = useState(true);
  
  const [studyTipsEmail, setStudyTipsEmail] = useState(true);
  const [studyTipsPush, setStudyTipsPush] = useState(false);
  const [studyTipsInApp, setStudyTipsInApp] = useState(false);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleBackup = () => {
    toast({
      title: "Backup initiated",
      description: "Your data is being backed up...",
    });
  };

  const handleDownloadReport = (format: string) => {
    toast({
      title: "Report generating",
      description: `Your ${format} report is being prepared for download.`,
    });
  };

  const menuItems = [
    { id: "overview", label: "Profile Overview", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "theme", label: "Theme Settings", icon: Palette },
    { id: "language", label: "Language", icon: Globe },
    { id: "privacy", label: "Privacy Policy", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "backup", label: "Backup & Sync", icon: Cloud },
    { id: "download", label: "Download Report", icon: Download },
    { id: "help", label: "Help & Support", icon: HelpCircle },
    { id: "about", label: "About", icon: Info },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Profile Overview</h2>
              <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
            </div>
            
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Student Name</h3>
                  <p className="text-muted-foreground">student@example.com</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input placeholder="Enter your full name" className="mt-2" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input placeholder="Enter your email" type="email" className="mt-2" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input placeholder="Enter your phone number" className="mt-2" />
                </div>
              </div>
              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </Card>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Notification Preferences</h2>
              <p className="text-muted-foreground mt-2">Manage how you receive notifications</p>
            </div>
            
            {/* General Notification Settings */}
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">General Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Get browser notifications</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Study Reminders</h4>
                  <p className="text-sm text-muted-foreground">Get reminders for scheduled study sessions</p>
                </div>
                <Switch checked={studyReminders} onCheckedChange={setStudyReminders} />
              </div>
            </Card>

            {/* Alert Type Preferences */}
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Alert Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">Choose how you want to be notified for different alert types</p>
              </div>

              {/* NTA Updates */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">NTA Updates & Announcements</h4>
                <div className="grid grid-cols-3 gap-4 ml-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="nta-email" 
                      checked={ntaUpdatesEmail} 
                      onCheckedChange={setNtaUpdatesEmail}
                      disabled={!emailNotifications}
                    />
                    <Label htmlFor="nta-email" className="text-sm font-normal">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="nta-push" 
                      checked={ntaUpdatesPush} 
                      onCheckedChange={setNtaUpdatesPush}
                      disabled={!pushNotifications}
                    />
                    <Label htmlFor="nta-push" className="text-sm font-normal">Push</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="nta-inapp" 
                      checked={ntaUpdatesInApp} 
                      onCheckedChange={setNtaUpdatesInApp}
                    />
                    <Label htmlFor="nta-inapp" className="text-sm font-normal">In-App</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Exam Notifications */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Exam Registration & Deadlines</h4>
                <div className="grid grid-cols-3 gap-4 ml-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="exam-email" 
                      checked={examNotifEmail} 
                      onCheckedChange={setExamNotifEmail}
                      disabled={!emailNotifications}
                    />
                    <Label htmlFor="exam-email" className="text-sm font-normal">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="exam-push" 
                      checked={examNotifPush} 
                      onCheckedChange={setExamNotifPush}
                      disabled={!pushNotifications}
                    />
                    <Label htmlFor="exam-push" className="text-sm font-normal">Push</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="exam-inapp" 
                      checked={examNotifInApp} 
                      onCheckedChange={setExamNotifInApp}
                    />
                    <Label htmlFor="exam-inapp" className="text-sm font-normal">In-App</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Schedule Reminders */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Study Schedule Reminders</h4>
                <div className="grid grid-cols-3 gap-4 ml-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="schedule-email" 
                      checked={scheduleRemindersEmail} 
                      onCheckedChange={setScheduleRemindersEmail}
                      disabled={!emailNotifications}
                    />
                    <Label htmlFor="schedule-email" className="text-sm font-normal">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="schedule-push" 
                      checked={scheduleRemindersPush} 
                      onCheckedChange={setScheduleRemindersPush}
                      disabled={!pushNotifications}
                    />
                    <Label htmlFor="schedule-push" className="text-sm font-normal">Push</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="schedule-inapp" 
                      checked={scheduleRemindersInApp} 
                      onCheckedChange={setScheduleRemindersInApp}
                    />
                    <Label htmlFor="schedule-inapp" className="text-sm font-normal">In-App</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quiz Results */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Quiz Results & Performance</h4>
                <div className="grid grid-cols-3 gap-4 ml-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="quiz-email" 
                      checked={quizResultsEmail} 
                      onCheckedChange={setQuizResultsEmail}
                      disabled={!emailNotifications}
                    />
                    <Label htmlFor="quiz-email" className="text-sm font-normal">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="quiz-push" 
                      checked={quizResultsPush} 
                      onCheckedChange={setQuizResultsPush}
                      disabled={!pushNotifications}
                    />
                    <Label htmlFor="quiz-push" className="text-sm font-normal">Push</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="quiz-inapp" 
                      checked={quizResultsInApp} 
                      onCheckedChange={setQuizResultsInApp}
                    />
                    <Label htmlFor="quiz-inapp" className="text-sm font-normal">In-App</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Study Tips */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Study Tips & Resources</h4>
                <div className="grid grid-cols-3 gap-4 ml-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="tips-email" 
                      checked={studyTipsEmail} 
                      onCheckedChange={setStudyTipsEmail}
                      disabled={!emailNotifications}
                    />
                    <Label htmlFor="tips-email" className="text-sm font-normal">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="tips-push" 
                      checked={studyTipsPush} 
                      onCheckedChange={setStudyTipsPush}
                      disabled={!pushNotifications}
                    />
                    <Label htmlFor="tips-push" className="text-sm font-normal">Push</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="tips-inapp" 
                      checked={studyTipsInApp} 
                      onCheckedChange={setStudyTipsInApp}
                    />
                    <Label htmlFor="tips-inapp" className="text-sm font-normal">In-App</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4">
                <Save className="mr-2 h-4 w-4" />
                Save Notification Preferences
              </Button>
            </Card>
          </div>
        );

      case "theme":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Theme Settings</h2>
              <p className="text-muted-foreground mt-2">Customize your visual experience</p>
            </div>
            
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <Separator />
              <div>
                <Label>Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>View Mode</Label>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Apply Theme</Button>
            </Card>
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Language Settings</h2>
              <p className="text-muted-foreground mt-2">Change your app language</p>
            </div>
            
            <Card className="p-6 space-y-4">
              <div>
                <Label>Preferred Language</Label>
                <Select defaultValue="english">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Save Language</Button>
            </Card>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Privacy Policy</h2>
              <p className="text-muted-foreground mt-2">Last updated: January 2025</p>
            </div>
            
            <Card className="p-6 space-y-6">
              <div className="prose prose-sm max-w-none">
                <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your data.</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Sharing</h4>
                  <p className="text-sm text-muted-foreground">Share usage data to improve services</p>
                </div>
                <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookie Preferences</h4>
                  <p className="text-sm text-muted-foreground">Allow cookies for better experience</p>
                </div>
                <Switch checked={cookiePreferences} onCheckedChange={setCookiePreferences} />
              </div>
              <Separator />
              <div>
                <Label>Account Visibility</Label>
                <Select value={accountVisibility} onValueChange={setAccountVisibility}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full">Download Privacy Policy (PDF)</Button>
            </Card>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Security Settings</h2>
              <p className="text-muted-foreground mt-2">Manage your account security</p>
            </div>
            
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <div className="relative mt-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className={`h-3 w-3 ${newPassword.length >= 8 ? "text-green-500" : "text-muted-foreground"}`} />
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className={`h-3 w-3 ${/[A-Z]/.test(newPassword) ? "text-green-500" : "text-muted-foreground"}`} />
                        <span>Contains uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className={`h-3 w-3 ${/[0-9]/.test(newPassword) ? "text-green-500" : "text-muted-foreground"}`} />
                        <span>Contains number</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="mt-2"
                    />
                  </div>
                  <Button className="w-full" onClick={handlePasswordChange}>
                    Change Password
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Active Sessions</h4>
                <p className="text-sm text-muted-foreground mb-3">You are logged in on 1 device</p>
                <Button variant="destructive" size="sm">Log Out All Devices</Button>
              </div>
            </Card>
          </div>
        );

      case "backup":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Backup & Sync</h2>
              <p className="text-muted-foreground mt-2">Manage your data backup settings</p>
            </div>
            
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Backup</h4>
                  <p className="text-sm text-muted-foreground">Automatically backup your data</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
              <Separator />
              <div>
                <Label>Backup Frequency</Label>
                <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cloud Storage Provider</Label>
                <Select value={cloudProvider} onValueChange={setCloudProvider}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="google">Google Drive</SelectItem>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                    <SelectItem value="onedrive">OneDrive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Last Backup</p>
                <p className="text-sm text-muted-foreground">January 8, 2025 at 2:30 PM</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Synced successfully
                </p>
              </div>
              <Button className="w-full" onClick={handleBackup}>
                <Upload className="mr-2 h-4 w-4" />
                Backup Now
              </Button>
            </Card>
          </div>
        );

      case "download":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Download Report</h2>
              <p className="text-muted-foreground mt-2">Generate and download your activity reports</p>
            </div>
            
            <Card className="p-6 space-y-6">
              <div>
                <Label>Report Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select defaultValue="last30">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                    <SelectItem value="last90">Last 90 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-3 block">Include in Report</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="profile" defaultChecked className="rounded" />
                    <label htmlFor="profile" className="text-sm">Profile Information</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="activity" defaultChecked className="rounded" />
                    <label htmlFor="activity" className="text-sm">Activity Logs</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="settings" className="rounded" />
                    <label htmlFor="settings" className="text-sm">Settings History</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="stats" defaultChecked className="rounded" />
                    <label htmlFor="stats" className="text-sm">Usage Statistics</label>
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={() => handleDownloadReport("PDF")}>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </Card>
          </div>
        );

      case "help":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Help & Support</h2>
              <p className="text-muted-foreground mt-2">Get help and contact support</p>
            </div>
            
            <Card className="p-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Contact Support</h4>
                <p className="text-sm text-muted-foreground mb-3">Email: support@prepiq.com</p>
                <Button variant="outline" className="w-full">Send Support Email</Button>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">FAQs</h4>
                <Button variant="outline" className="w-full justify-between">
                  View Frequently Asked Questions
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Documentation</h4>
                <Button variant="outline" className="w-full justify-between">
                  Access User Guide
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        );

      case "about":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">About PrepIQ</h2>
              <p className="text-muted-foreground mt-2">Application information and version details</p>
            </div>
            
            <Card className="p-6 space-y-4">
              <div className="text-center py-6">
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">PQ</span>
                </div>
                <h3 className="text-xl font-semibold">PrepIQ</h3>
                <p className="text-sm text-muted-foreground">Your AI-Powered Study Companion</p>
                <p className="text-xs text-muted-foreground mt-2">Version 1.0.0</p>
              </div>
              <Separator />
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  Terms of Service
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/privacy")}>
                  Privacy Policy
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Licenses
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <div className="text-center text-xs text-muted-foreground">
                <p>© 2025 PrepIQ. All rights reserved.</p>
                <p className="mt-1">Made with ❤️ for students worldwide</p>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </Button>
          </div>
          <h1 className="text-xl font-bold">Settings</h1>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="space-y-2">
            <Card className="p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as SettingsSection)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  );
                })}
              </nav>
              <Separator className="my-4" />
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="min-h-[600px]">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
