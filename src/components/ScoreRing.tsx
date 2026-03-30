import React from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
  className?: string;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score, label, size = 100, className }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "text-success";
    if (s >= 60) return "text-accent";
    if (s >= 40) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(getColor(score), "animate-score-fill")}
            style={{ "--initial-offset": circumference } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold font-heading text-foreground">{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default ScoreRing;
