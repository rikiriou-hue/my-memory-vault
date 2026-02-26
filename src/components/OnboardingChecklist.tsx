import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Camera, Heart, Mail, MapPin, UserPlus, X, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface ChecklistItem {
  key: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  to: string;
  done: boolean;
}

interface Props {
  coupleId: string | null;
  hasPartner: boolean;
}

const OnboardingChecklist = ({ coupleId, hasPartner }: Props) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coupleId) return;
    checkProgress();
  }, [coupleId]);

  const checkProgress = async () => {
    if (!coupleId) return;

    const [memories, notes, letters, locations] = await Promise.all([
      supabase.from("memories").select("id", { count: "exact", head: true }).eq("couple_id", coupleId),
      supabase.from("love_notes").select("id", { count: "exact", head: true }).eq("couple_id", coupleId),
      supabase.from("future_letters").select("id", { count: "exact", head: true }).eq("couple_id", coupleId),
      supabase.from("memory_locations").select("id", { count: "exact", head: true }).eq("couple_id", coupleId),
    ]);

    const checklist: ChecklistItem[] = [
      {
        key: "partner",
        label: "Undang Pasangan",
        desc: "Ajak pasanganmu bergabung",
        icon: <UserPlus className="w-4 h-4" />,
        to: "/profile",
        done: hasPartner,
      },
      {
        key: "memory",
        label: "Tambah Memory Pertama",
        desc: "Abadikan momen spesial kalian",
        icon: <Camera className="w-4 h-4" />,
        to: "/timeline",
        done: (memories.count ?? 0) > 0,
      },
      {
        key: "note",
        label: "Tulis Love Note",
        desc: "Kirim kata-kata manis",
        icon: <Heart className="w-4 h-4" />,
        to: "/notes",
        done: (notes.count ?? 0) > 0,
      },
      {
        key: "letter",
        label: "Buat Future Letter",
        desc: "Surat untuk dibuka nanti",
        icon: <Mail className="w-4 h-4" />,
        to: "/future-letters",
        done: (letters.count ?? 0) > 0,
      },
      {
        key: "location",
        label: "Tandai Tempat Kenangan",
        desc: "Pin lokasi spesial di peta",
        icon: <MapPin className="w-4 h-4" />,
        to: "/memory-map",
        done: (locations.count ?? 0) > 0,
      },
    ];

    setItems(checklist);
    setLoading(false);

    const allDone = checklist.every((i) => i.done);
    if (allDone) {
      const wasDismissed = localStorage.getItem("onboarding-dismissed");
      if (!wasDismissed) {
        localStorage.setItem("onboarding-dismissed", "true");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#ff6b8a", "#ff8fa3", "#ffb3c1", "#ffd6e0", "#c9184a"],
        });
        setTimeout(() => {
          confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#ff6b8a", "#ff8fa3", "#ffb3c1"] });
          confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#ff6b8a", "#ff8fa3", "#ffb3c1"] });
        }, 300);
      }
      setDismissed(true);
    } else {
      const wasDismissed = localStorage.getItem("onboarding-dismissed");
      if (wasDismissed) setDismissed(true);
    }
  };

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  if (loading || dismissed || !coupleId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative bg-card rounded-md p-6 shadow-lg border border-border overflow-hidden"
    >
      {/* Tape */}
      <div
        className="absolute -top-3 right-10 w-16 h-5 rounded-sm rotate-[2deg]"
        style={{ background: "hsl(var(--tape) / 0.6)" }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-handwritten text-xl text-foreground">Mulai Petualangan Kalian!</h3>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem("onboarding-dismissed", "true");
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-secondary rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(doneCount / items.length) * 100}%` }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-3 font-sans">
        {doneCount}/{items.length} selesai
      </p>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <Link
                to={item.to}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  item.done
                    ? "bg-primary/5 opacity-60"
                    : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-sans ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                </div>
                <span className="text-lg">{item.icon}</span>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <span className="absolute bottom-2 right-3 text-2xl opacity-15 -rotate-6">🎯</span>
    </motion.div>
  );
};

export default OnboardingChecklist;
