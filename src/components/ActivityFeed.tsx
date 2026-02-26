import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Camera, Heart, Mail, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: "memory" | "note" | "letter";
  title: string;
  createdAt: string;
  to: string;
}

interface Props {
  coupleId: string | null;
}

const iconMap = {
  memory: <Camera className="w-4 h-4" />,
  note: <Heart className="w-4 h-4" />,
  letter: <Mail className="w-4 h-4" />,
};

const labelMap = {
  memory: "Memory baru",
  note: "Love Note",
  letter: "Future Letter",
};

const ActivityFeed = ({ coupleId }: Props) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coupleId) return;
    fetchActivities();
  }, [coupleId]);

  const fetchActivities = async () => {
    if (!coupleId) return;

    const [memoriesRes, notesRes, lettersRes] = await Promise.all([
      supabase
        .from("memories")
        .select("id, title, created_at")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("love_notes")
        .select("id, content, created_at")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("future_letters")
        .select("id, title, created_at")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const items: ActivityItem[] = [
      ...(memoriesRes.data ?? []).map((m) => ({
        id: m.id,
        type: "memory" as const,
        title: m.title,
        createdAt: m.created_at,
        to: "/timeline",
      })),
      ...(notesRes.data ?? []).map((n) => ({
        id: n.id,
        type: "note" as const,
        title: n.content.substring(0, 50) + (n.content.length > 50 ? "..." : ""),
        createdAt: n.created_at,
        to: "/notes",
      })),
      ...(lettersRes.data ?? []).map((l) => ({
        id: l.id,
        type: "letter" as const,
        title: l.title,
        createdAt: l.created_at,
        to: "/future-letters",
      })),
    ];

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setActivities(items.slice(0, 5));
    setLoading(false);
  };

  if (loading || !coupleId) return null;
  if (activities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="relative bg-card rounded-md p-6 shadow-lg border border-border overflow-hidden"
    >
      {/* Tape */}
      <div
        className="absolute -top-3 left-12 w-16 h-5 rounded-sm rotate-[1deg]"
        style={{ background: "hsl(var(--tape) / 0.6)" }}
      />

      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-handwritten text-xl text-foreground">Aktivitas Terbaru</h3>
      </div>

      <div className="space-y-3">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.08 }}
          >
            <Link
              to={activity.to}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                {iconMap[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans text-foreground truncate group-hover:text-primary transition-colors">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>{labelMap[activity.type]}</span>
                  <span>·</span>
                  <span>
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                  </span>
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <span className="absolute bottom-2 right-3 text-2xl opacity-15 rotate-6">📋</span>
    </motion.div>
  );
};

export default ActivityFeed;
