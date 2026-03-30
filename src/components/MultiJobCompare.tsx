import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ScoreRing from "@/components/ScoreRing";
import { AnalysisResult } from "@/components/AnalysisResults";
import { analyzeResume } from "@/lib/resumeAnalyzer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, X, Sparkles, BarChart3, Trophy } from "lucide-react";
import { toast } from "sonner";

interface JobEntry {
  id: string;
  jobTitle: string;
  jobDescription: string;
}

interface ComparisonResult {
  job: JobEntry;
  result: AnalysisResult;
}

interface MultiJobCompareProps {
  resume: string;
}

const MultiJobCompare: React.FC<MultiJobCompareProps> = ({ resume }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobEntry[]>([
    { id: "1", jobTitle: "", jobDescription: "" },
    { id: "2", jobTitle: "", jobDescription: "" },
  ]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addJob = () => {
    if (jobs.length >= 5) return;
    setJobs([...jobs, { id: Date.now().toString(), jobTitle: "", jobDescription: "" }]);
  };

  const removeJob = (id: string) => {
    if (jobs.length <= 2) return;
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const updateJob = (id: string, field: "jobTitle" | "jobDescription", value: string) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  };

  const handleCompare = async () => {
    if (!user) {
      toast.error("Please sign in to compare job roles");
      return;
    }
    
    const validJobs = jobs.filter((j) => j.jobTitle.trim());
    if (validJobs.length < 2) {
      toast.error("Please fill in at least 2 job titles");
      return;
    }
    if (!resume.trim()) {
      toast.error("Please paste your resume first");
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const analysisPromises = validJobs.map(async (job) => {
        const result = await analyzeResume({
          resume,
          jobTitle: job.jobTitle,
          jobDescription: job.jobDescription,
        });
        // Save to history
        await supabase.from("analysis_history").insert({
          user_id: user.id,
          resume_text: resume,
          job_title: job.jobTitle,
          job_description: job.jobDescription || "",
          scores: result.scores as any,
          before_score: result.beforeScore,
          strengths: result.strengths as any,
          weaknesses: result.weaknesses as any,
          improvements: result.improvements as any,
          missing_keywords: result.missingKeywords as any,
          improved_resume: result.improvedResume,
          suggestions: result.suggestions as any,
        } as any);
        return { job, result };
      });

      const completed = await Promise.all(analysisPromises);
      setResults(completed);
      toast.success(`Compared ${completed.length} roles!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Comparison failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const bestResult = results.length
    ? results.reduce((best, r) => (r.result.scores.overall > best.result.scores.overall ? r : best))
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {jobs.map((job, index) => (
          <div key={job.id} className="flex gap-3 items-start">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                value={job.jobTitle}
                onChange={(e) => updateJob(job.id, "jobTitle", e.target.value)}
                placeholder={`Job title ${index + 1} (e.g. Frontend Engineer)`}
                className="bg-card"
              />
              <Input
                value={job.jobDescription}
                onChange={(e) => updateJob(job.id, "jobDescription", e.target.value)}
                placeholder="Key requirements (optional)"
                className="bg-card"
              />
            </div>
            {jobs.length > 2 && (
              <Button variant="ghost" size="icon" onClick={() => removeJob(job.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {jobs.length < 5 && (
          <Button variant="outline" size="sm" onClick={addJob} className="gap-1.5 text-sm">
            <Plus className="w-3.5 h-3.5" />
            Add Role
          </Button>
        )}
        <Button
          onClick={handleCompare}
          disabled={isLoading || jobs.filter((j) => j.jobTitle.trim()).length < 2}
          className="gradient-gold text-accent-foreground border-0 gap-1.5"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Compare Roles
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4 animate-fade-up">
          <h3 className="text-lg font-heading font-semibold text-foreground">Comparison Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results
              .sort((a, b) => b.result.scores.overall - a.result.scores.overall)
              .map((r, i) => (
                <Card
                  key={r.job.id}
                  className={`shadow-card ${r === bestResult ? "ring-2 ring-accent" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {r === bestResult && <Trophy className="w-4 h-4 text-accent" />}
                      <span className="truncate">{r.job.jobTitle}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {r.result.beforeScore} → {r.result.scores.overall} (+{r.result.scores.overall - r.result.beforeScore})
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      <ScoreRing score={r.result.scores.ats} label="ATS" size={56} />
                      <ScoreRing score={r.result.scores.impact} label="Impact" size={56} />
                      <ScoreRing score={r.result.scores.clarity} label="Clarity" size={56} />
                      <ScoreRing score={r.result.scores.relevance} label="Relevance" size={56} />
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Missing Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {r.result.missingKeywords.slice(0, 5).map((kw, ki) => (
                          <span key={ki} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {kw}
                          </span>
                        ))}
                        {r.result.missingKeywords.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{r.result.missingKeywords.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiJobCompare;
