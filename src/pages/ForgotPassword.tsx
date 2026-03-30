import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Check your email for a reset link!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mx-auto">
            <FileSearch className="w-6 h-6 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            {sent ? "We've sent you a reset link" : "Enter your email to receive a reset link"}
          </p>
        </div>

        <Card className="shadow-elevated border-border">
          <CardContent className="pt-6 space-y-4">
            {sent ? (
              <p className="text-sm text-muted-foreground text-center">
                Check your inbox for <strong className="text-foreground">{email}</strong> and click the link to reset your password.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-gold text-accent-foreground border-0">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
            <Link to="/auth" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
