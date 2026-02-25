/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Save, User, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTheme, type ThemeName } from "@/components/ThemeProvider";

const THEMES: { id: ThemeName; label: string; emoji: string; desc: string; colors: string[] }[] = [
  {
    id: "romantic-rose",
    label: "Romantic Rose",
    emoji: "🌹",
    desc: "Warm vintage love diary",
    colors: ["hsl(347,77%,50%)", "hsl(340,15%,6%)", "hsl(347,60%,65%)", "hsl(30,20%,88%)"],
  },
  {
    id: "nature-memory",
    label: "Nature Memory",
    emoji: "🌿",
    desc: "Forest journal aesthetic",
    colors: ["hsl(120,30%,40%)", "hsl(90,12%,6%)", "hsl(120,25%,55%)", "hsl(60,15%,85%)"],
  },
  {
    id: "ocean-dream",
    label: "Ocean Dream",
    emoji: "🌊",
    desc: "Calm & dreamy",
    colors: ["hsl(190,60%,45%)", "hsl(210,20%,7%)", "hsl(190,45%,60%)", "hsl(210,15%,88%)"],
  },
  {
    id: "midnight-vintage",
    label: "Midnight Vintage",
    emoji: "✨",
    desc: "Elegant & mysterious",
    colors: ["hsl(42,70%,50%)", "hsl(30,8%,4%)", "hsl(42,55%,60%)", "hsl(40,30%,85%)"],
  },
];

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(theme);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, theme")
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url);
        if (data.theme) setSelectedTheme(data.theme as ThemeName);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleThemePreview = (t: ThemeName) => {
    setSelectedTheme(t);
    setTheme(t);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setAvatarUrl(result.url);

      await supabase
        .from("profiles")
        .update({ avatar_url: result.url })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id!);

      toast.success("Foto profil berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null, theme: selectedTheme })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id!);

      if (error) throw error;
      toast.success("Profil berhasil disimpan");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-md mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="scrapbook-card p-8"
          >
            <h1 className="font-serif text-2xl text-foreground text-center mb-8">Profil Kamu</h1>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="w-24 h-24 border-2 border-primary/20">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Avatar" />
                  ) : null}
                  <AvatarFallback className="bg-secondary text-muted-foreground">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <p className="font-handwritten text-sm text-muted-foreground mt-2">
                Ketuk untuk ganti foto
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="displayName" className="font-handwritten text-base">
                Nama Tampilan
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Masukkan nama kamu..."
                className="font-sans"
              />
            </div>

            {/* Theme Picker */}
            <div className="space-y-3 mb-8">
              <Label className="font-handwritten text-base">Tema Scrapbook</Label>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleThemePreview(t.id)}
                    className={`relative rounded-xl p-3 text-left transition-all duration-300 border-2 ${
                      selectedTheme === t.id
                        ? "border-primary shadow-[0_0_20px_hsl(var(--rose-glow))]"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                    style={{ background: t.colors[1] }}
                  >
                    {selectedTheme === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: t.colors[0] }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-xl mb-1 block">{t.emoji}</span>
                    <p className="font-handwritten text-sm" style={{ color: t.colors[3] }}>{t.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-60" style={{ color: t.colors[3] }}>{t.desc}</p>
                    <div className="flex gap-1 mt-2">
                      {t.colors.map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan
            </Button>
          </motion.div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Profile;
