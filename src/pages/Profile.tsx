import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Save, Download, Smartphone, Monitor, Globe } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const Profile = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url || null);
        }
        setLoading(false);
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(publicUrl + "?t=" + Date.now());
    setUploading(false);
    toast.success("Avatar uploaded");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadWebApp = () => {
    // Download the actual built app as a ZIP
    const downloadUrl = "https://github.com/shauryarajput930/resume-ai/archive/refs/heads/main.zip";
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "ResumeAI-Source-Code.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloading ResumeAI source code...");
  };

  const handleInstallPWA = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.installing) {
          toast.info("PWA is installing...");
        } else if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          toast.info("PWA updated and installed");
        } else {
          toast.info("PWA already installed");
        }
      } catch (error) {
        toast.error("PWA installation failed");
      }
    } else {
      toast.error("PWA not supported on this device");
    }
  };

  const handleDownloadDesktop = () => {
    // Create a desktop app wrapper using Electron-like approach
    const desktopAppContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResumeAI Desktop</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: system-ui, sans-serif;
            overflow: hidden;
        }
        iframe {
            width: 100vw;
            height: 100vh;
            border: none;
        }
        .toolbar {
            background: #1f2937;
            color: white;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo {
            font-weight: bold;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <div class="logo">🚀 ResumeAI</div>
        <div style="margin-left: auto; font-size: 12px;">Desktop Version</div>
    </div>
    <iframe src="${window.location.origin}" frameborder="0"></iframe>
</body>
</html>`;

    const blob = new Blob([desktopAppContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ResumeAI-Desktop.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Desktop app downloaded. Open the HTML file for desktop experience.");
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
              <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">Profile Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10 space-y-6">
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-heading text-foreground">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl font-heading bg-secondary text-secondary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-background" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {uploading ? "Uploading..." : "Hover to change avatar"}
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input value={user?.email || ""} disabled className="opacity-60" />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gradient-gold text-accent-foreground border-0 gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* App Download Section */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-heading text-foreground flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download ResumeAI App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get ResumeAI on your preferred platform for quick access anytime.
            </p>
            
            <div className="grid gap-3">
              <Button 
                onClick={handleDownloadWebApp} 
                variant="outline" 
                className="justify-start gap-3 hover-scale"
              >
                <Globe className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Source Code</div>
                  <div className="text-xs text-muted-foreground">Download complete source code</div>
                </div>
              </Button>

              <Button 
                onClick={handleInstallPWA} 
                variant="outline" 
                className="justify-start gap-3 hover-scale"
              >
                <Smartphone className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Install PWA</div>
                  <div className="text-xs text-muted-foreground">Install as mobile app</div>
                </div>
              </Button>

              <Button 
                onClick={handleDownloadDesktop} 
                variant="outline" 
                className="justify-start gap-3 hover-scale"
              >
                <Monitor className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Desktop App</div>
                  <div className="text-xs text-muted-foreground">Download desktop wrapper</div>
                </div>
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> ResumeAI is a web-based application. These options create shortcuts and installations for easier access while requiring an internet connection for full functionality.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
