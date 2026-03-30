import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles, ArrowRight, Upload } from "lucide-react";
import { toast } from "sonner";

interface ResumeInputFormProps {
  onAnalyze: (data: { resume: string; jobTitle: string; jobDescription: string }) => void;
  isLoading: boolean;
}

const ResumeInputForm: React.FC<ResumeInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [resume, setResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resume.trim() && jobTitle.trim()) {
      onAnalyze({ resume, jobTitle, jobDescription });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File too large. Please upload a file under 5MB.");
      return;
    }

    try {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        setResume(text);
        toast.success("Resume text loaded successfully");
      } else if (
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".docx")
      ) {
        // For PDF/DOCX, read as text fallback (basic extraction)
        const text = await file.text();
        if (text.trim().length > 50) {
          setResume(text);
          toast.success("Resume content extracted");
        } else {
          toast.info(
            "Could not extract text from this file. Please copy and paste your resume text instead.",
            { duration: 5000 }
          );
        }
      } else {
        toast.error("Unsupported file type. Please upload a .txt, .pdf, or .docx file.");
      }
    } catch {
      toast.error("Failed to read file. Please try pasting your resume text instead.");
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            Resume Text
          </label>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload file
            </Button>
          </div>
        </div>
        <Textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume content here, or upload a file above..."
          className="min-h-[240px] resize-y font-body text-sm leading-relaxed bg-card border-border focus:ring-accent"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Target Job Role <span className="text-destructive">*</span>
          </label>
          <Input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="bg-card"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Job Description <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste key requirements from the job listing..."
            className="min-h-[40px] h-10 resize-y bg-card text-sm"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !resume.trim() || !jobTitle.trim()}
        className="w-full h-12 text-base font-semibold gradient-gold text-accent-foreground hover:opacity-90 transition-opacity border-0"
      >
        {isLoading ? (
          <>
            <Sparkles className="w-5 h-5 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            Analyze & Optimize
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </form>
  );
};

export default ResumeInputForm;
