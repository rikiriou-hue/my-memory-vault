import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Camera, Heart, Mail, MapPin, BarChart3 } from "lucide-react";

interface Props {
  coupleId: string | null;
}

interface Stats {
  memories: number;
  notes: number;
  letters: number;
  locations: number;
}

const RelationshipStats = ({ coupleId }: Props) => {
  const [stats, setStats] = useState<Stats>({ memories: 0, notes: 0, letters: 0, locations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coupleId) return;
    fetchStats();
  }, [coupleId]);

  const fetchStats = async () => {
    if (!coupleId) return;

    const [memories, notes, letters, locations] = await Promise.all([
      supabase.from("memories").select("id", { count: "exact", head: true }).eq("couple_id", coupleId),
      supabase.from("love_notes").select("id", { count: "exact", head: true }).eq("couple_id", coupleId),
      supabase.from("future_letters").select("id", { count: "exact", head: true }).eq("couple_id", coupleId),
      supabase.from("memory_locations").select("id", { count: "exact", head: true }).eq("couple_id", coupleId),
    ]);

    setStats({
      memories: memories.count ?? 0,
      notes: notes.count ?? 0,
      letters: letters.count ?? 0,
      locations: locations.count ?? 0,
    });
    setLoading(false);
  };

  if (loading || !coupleId) return null;

  const items = [
    { label: "Memories", value: stats.memories, icon: <Camera className="w-5 h-5" />, emoji: "📸" },
    { label: "Love Notes", value: stats.notes, icon: <Heart className="w-5 h-5" />, emoji: "💕" },
    { label: "Letters", value: stats.letters, icon: <Mail className="w-5 h-5" />, emoji: "💌" },
    { label: "Tempat", value: stats.locations, icon: <MapPin className="w-5 h-5" />, emoji: "📍" },
  ];

  const total = stats.memories + stats.notes + stats.letters + stats.locations;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative bg-card rounded-md p-6 shadow-lg border border-border overflow-hidden"
    >
      {/* Tape */}
      <div
        className="absolute -top-3 right-8 w-16 h-5 rounded-sm rotate-[-2deg]"
        style={{ background: "hsl(var(--tape) / 0.6)" }}
      />

      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="font-handwritten text-xl text-foreground">Statistik Hubungan</h3>
      </div>

      {/* Total */}
      <div className="text-center mb-5">
        <motion.span
          className="text-5xl font-handwritten text-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
        >
          {total}
        </motion.span>
        <p className="text-sm text-muted-foreground font-sans mt-1">total kenangan tersimpan</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="relative bg-secondary/50 rounded-lg p-3 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary mx-auto mb-2">
              {item.icon}
            </div>
            <p className="text-2xl font-handwritten text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground font-sans">{item.label}</p>
            <span className="absolute -top-2 -right-1 text-lg opacity-30 rotate-12">{item.emoji}</span>
          </motion.div>
        ))}
      </div>

      <span className="absolute bottom-2 right-3 text-2xl opacity-15 -rotate-6">📊</span>
    </motion.div>
  );
};

export default RelationshipStats;
