import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScoreRing from "@/components/ScoreRing";
import { Clock, Trash2, ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface HistoryEntry {
  id: string;
  job_title: string;
  job_description: string;
  scores: { overall: number; ats: number; impact: number; clarity: number; relevance: number };
  before_score: number;
  created_at: string;
}

const History = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("analysis_history")
      .select("id, job_title, job_description, scores, before_score, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load history");
      console.error(error);
    } else {
      setEntries((data as unknown as HistoryEntry[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analysis_history").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    }
  };

  const averageScore = entries.length
    ? Math.round(entries.reduce((sum, e) => sum + (e.scores as any).overall, 0) / entries.length)
    : 0;

  const bestScore = entries.length
    ? Math.max(...entries.map((e) => (e.scores as any).overall))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">Analysis History</h1>
              <p className="text-xs text-muted-foreground">Track your resume improvements over time</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Summary stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="shadow-card">
              <CardContent className="pt-5 text-center">
                <p className="text-3xl font-heading font-bold text-foreground">{entries.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Analyses</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-5 text-center">
                <p className="text-3xl font-heading font-bold text-foreground">{averageScore}</p>
                <p className="text-xs text-muted-foreground mt-1">Average Score</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-5 text-center">
                <p className="text-3xl font-heading font-bold text-accent">{bestScore}</p>
                <p className="text-xs text-muted-foreground mt-1">Best Score</p>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading history...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">No analyses yet. Go analyze a resume!</p>
            <Link to="/">
              <Button className="gradient-gold text-accent-foreground border-0">Start Analysis</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const scores = entry.scores as any;
              return (
                <Card key={entry.id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="py-5 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading font-semibold text-foreground truncate">
                            {entry.job_title}
                          </h3>
                          <Badge variant="secondary" className="shrink-0">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {entry.before_score} → {scores.overall}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-4">
                        <div className="hidden md:flex gap-3">
                          <ScoreRing score={scores.ats} label="ATS" size={48} />
                          <ScoreRing score={scores.impact} label="Impact" size={48} />
                          <ScoreRing score={scores.clarity} label="Clarity" size={48} />
                          <ScoreRing score={scores.relevance} label="Relevance" size={48} />
                        </div>
                        <div className="md:hidden">
                          <ScoreRing score={scores.overall} label="Overall" size={48} />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
