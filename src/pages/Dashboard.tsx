import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Heart, Mail, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import DayCounter from "@/components/DayCounter";
import PageTransition from "@/components/PageTransition";
import InvitePartnerDialog from "@/components/InvitePartnerDialog";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [coupleName, setCoupleName] = useState("Our Story");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [hasPartner, setHasPartner] = useState(true);

  const fetchData = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("couple_id")
      .single();

    if (profile?.couple_id) {
      setCoupleId(profile.couple_id);

      const { data: couple } = await supabase
        .from("couples")
        .select("*")
        .eq("id", profile.couple_id)
        .single();

      if (couple) {
        setCoupleName(couple.name);
        setStartDate(couple.start_date);
      }

      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);

      setHasPartner((count ?? 0) >= 2);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cards = [
    {
      to: "/timeline",
      icon: <Camera className="w-6 h-6" />,
      title: "Timeline",
      desc: "Our precious memories",
      sticker: "📸",
      rotate: "-2deg",
      size: "md:col-span-2",
    },
    {
      to: "/notes",
      icon: <Heart className="w-6 h-6" />,
      title: "Love Notes",
      desc: "Sweet little words",
      sticker: "💕",
      rotate: "2deg",
      size: "",
    },
    {
      to: "/future-letters",
      icon: <Mail className="w-6 h-6" />,
      title: "Future Letters",
      desc: "Open when time is right",
      sticker: "💌",
      rotate: "-1.5deg",
      size: "",
    },
    {
      to: "/memory-map",
      icon: <MapPin className="w-6 h-6" />,
      title: "Memory Map",
      desc: "Places we’ve been",
      sticker: "📍",
      rotate: "1.5deg",
      size: "md:col-span-2",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">

      {/* ✨ DREAMY BACKGROUND GLOW */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-rose-400/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-orange-300/10 rounded-full blur-[120px]" />

      {/* 🌸 Floating Stickers */}
      <span className="absolute top-16 left-12 text-4xl opacity-20 rotate-12">🌸</span>
      <span className="absolute bottom-24 right-16 text-3xl opacity-20 -rotate-6">🧸</span>
      <span className="absolute top-1/2 right-10 text-3xl opacity-20 rotate-6">💌</span>

      <Navbar />

      <PageTransition>
        <main className="max-w-6xl mx-auto px-6 py-20 relative z-10">

          {/* 💖 HERO */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl text-rose-300 drop-shadow-lg mb-6">
              {coupleName}
            </h1>

            {startDate && (
              <div className="font-handwritten text-3xl text-rose-200">
                <DayCounter initialStartDate={startDate} />
              </div>
            )}
          </div>

          {/* 📒 PINTEREST STYLE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 auto-rows-[220px]">

            {cards.map((card, i) => (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className={`${card.size}`}
              >
                <Link
                  to={card.to}
                  className="relative block h-full p-8 bg-[hsl(20,20%,18%)] rounded-md shadow-2xl hover:scale-[1.04] transition-all duration-500"
                  style={{ transform: `rotate(${card.rotate})` }}
                >
                  {/* Paper Layer */}
                  <div className="absolute inset-2 bg-[hsl(20,15%,22%)] -z-10 rounded-md rotate-2"></div>

                  {/* Tape */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-yellow-200/60 rounded-sm rotate-[-2deg]"></div>

                  {/* Sticker */}
                  <div className="absolute -top-5 -right-4 text-3xl rotate-6">
                    {card.sticker}
                  </div>

                  <div className="w-14 h-14 rounded-full bg-rose-300/20 flex items-center justify-center text-rose-300 mb-4">
                    {card.icon}
                  </div>

                  <h2 className="font-handwritten text-3xl mb-2">
                    {card.title}
                  </h2>

                  <p className="font-handwritten opacity-70">
                    {card.desc}
                  </p>

                </Link>
              </motion.div>
            ))}

            {!hasPartner && coupleId && (
              <InvitePartnerDialog coupleId={coupleId} onJoined={fetchData} />
            )}

          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Dashboard;