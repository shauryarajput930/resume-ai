import React, { useState, useEffect } from "react";
import ResumeInputForm from "@/components/ResumeInputForm";
import AnalysisResults, { AnalysisResult } from "@/components/AnalysisResults";
import MultiJobCompare from "@/components/MultiJobCompare";
import ThemeToggle from "@/components/ThemeToggle";
import { analyzeResume } from "@/lib/resumeAnalyzer";
import { FileSearch, Shield, Zap, History, BarChart3, LogIn, LogOut, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [compareResume, setCompareResume] = useState("");
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await signOut();
    setShowLogoutDialog(false);
    toast.success("Logged out successfully");
  };

  const handleAnalyze = async (data: { resume: string; jobTitle: string; jobDescription: string }) => {
    if (!user) {
      toast.error("Please sign in to analyze your resume");
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeResume(data);
      setResult(analysis);
      toast.success("Analysis complete!");
      await supabase.from("analysis_history").insert({
        user_id: user.id,
        resume_text: data.resume,
        job_title: data.jobTitle,
        job_description: data.jobDescription || "",
        scores: analysis.scores as any,
        before_score: analysis.beforeScore,
        strengths: analysis.strengths as any,
        weaknesses: analysis.weaknesses as any,
        improvements: analysis.improvements as any,
        missing_keywords: analysis.missingKeywords as any,
        improved_resume: analysis.improvedResume,
        suggestions: analysis.suggestions as any,
      } as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center">
              <FileSearch className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">ResumeAI</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Resume Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent">
                      <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                        {profile?.avatar_url ? (
                          <AvatarImage src={profile.avatar_url} alt={profile.display_name || "User"} />
                        ) : null}
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {(profile?.display_name || user?.email || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/history" className="flex items-center gap-2 cursor-pointer">
                        <History className="w-4 h-4" />
                        History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {user && !user.email_confirmed_at && (
        <div className="bg-destructive/10 border-b border-destructive/20">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Please verify your email address. Check your inbox for a confirmation link.</span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {!result && (
          <div className="text-center space-y-4 pb-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">
              Land More Interviews
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Paste your resume or upload a file, specify the target role, and get AI-powered feedback with ATS scoring, keyword optimization, and a fully rewritten version.
            </p>
            <div className="flex items-center justify-center gap-6 pt-2">
              {[
                { icon: Shield, label: "ATS Scoring" },
                { icon: Zap, label: "AI Analysis" },
                { icon: FileSearch, label: "Keyword Match" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-accent" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {!user ? (
          <div className="bg-card rounded-xl border border-border shadow-card p-6 md:p-8 text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Sign In Required</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  To access our AI-powered resume analysis and optimization features, please sign in to your account.
                </p>
              </div>
              <div className="space-y-3">
                <Link to="/auth">
                  <Button className="w-full sm:w-auto gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In to Analyze Resume
                  </Button>
                </Link>
                <div className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign up for free
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">ATS Analysis</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your resume scored by industry-standard ATS systems
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Zap className="w-5 h-5" />
                    <span className="font-medium">AI Optimization</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Receive AI-powered suggestions to improve your resume
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <FileSearch className="w-5 h-5" />
                    <span className="font-medium">Job Matching</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compare your resume against specific job descriptions
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="analyze" className="gap-1.5">
                <Zap className="w-4 h-4" />
                Analyze
              </TabsTrigger>
              <TabsTrigger value="compare" className="gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Compare Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze">
              <div className="bg-card rounded-xl border border-border shadow-card p-6 md:p-8">
                <ResumeInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              </div>
            </TabsContent>

            <TabsContent value="compare">
              <div className="bg-card rounded-xl border border-border shadow-card p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Resume Text</label>
                  <Textarea
                    value={compareResume}
                    onChange={(e) => setCompareResume(e.target.value)}
                    placeholder="Paste your resume here, then add multiple job roles below to compare..."
                    className="min-h-[160px] resize-y font-body text-sm leading-relaxed bg-card border-border"
                  />
                </div>
                <MultiJobCompare resume={compareResume} />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {result && user && <AnalysisResults result={result} />}
      </main>

      <footer className="border-t border-border py-6 mt-12">
        <p className="text-center text-xs text-muted-foreground">
          ResumeAI — AI-powered resume optimization for Applicant Tracking Systems
        </p>
      </footer>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You'll need to sign in again to access your analysis history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
