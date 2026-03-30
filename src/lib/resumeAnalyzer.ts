import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult } from "@/components/AnalysisResults";

export async function analyzeResume(data: {
  resume: string;
  jobTitle: string;
  jobDescription: string;
}): Promise<AnalysisResult> {
  const { data: result, error } = await supabase.functions.invoke("analyze-resume", {
    body: data,
  });

  if (error) {
    throw new Error(error.message || "Failed to analyze resume");
  }

  if (result?.error) {
    throw new Error(result.error);
  }

  return result as AnalysisResult;
}
