import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, RefreshCw, Copy, Check } from "lucide-react";

const LOVE_PROMPTS = [
  "Apa hal kecil yang bikin kamu jatuh cinta hari ini? 💕",
  "Ceritakan satu momen lucu yang pernah kalian alami bersama 😄",
  "Kalau bisa pergi ke mana saja, kamu mau ajak pasanganmu ke mana? ✈️",
  "Apa lagu yang mengingatkanmu pada pasanganmu? 🎵",
  "Tuliskan 3 hal yang kamu syukuri tentang hubungan ini 🙏",
  "Apa makanan favorit yang sering kalian makan bersama? 🍕",
  "Deskripsikan pasanganmu dalam 3 kata 💝",
  "Kapan terakhir kali kamu tertawa lepas bersama pasangan? 😂",
  "Apa mimpi yang ingin kalian wujudkan bersama? 🌟",
  "Tuliskan satu hal yang belum pernah kamu bilang ke pasanganmu 💌",
  "Apa film atau series yang paling seru ditonton berdua? 🎬",
  "Kalau menulis surat cinta, kalimat pertamanya apa? ✍️",
  "Apa kebiasaan pasanganmu yang paling kamu suka? 🥰",
  "Rencanakan date night impian kalian! Mau ngapain aja? 🌙",
  "Apa pelajaran terbesar yang kamu dapat dari hubungan ini? 📖",
  "Ceritakan first impression kamu saat pertama ketemu pasangan 👀",
  "Apa hal random yang bikin kamu kangen pasangan? 🫶",
  "Kalau bikin playlist berdua, genre apa yang dominan? 🎧",
  "Apa tradisi kecil yang cuma kalian berdua yang tau? 🤫",
  "Describe your perfect lazy Sunday bersama pasangan ☀️",
  "Apa superpower pasanganmu yang paling kamu kagumi? 💪",
  "Tuliskan satu promise kecil untuk pasanganmu hari ini 🤝",
  "Apa comfort food yang selalu bikin mood kalian membaik? 🍜",
  "Ceritakan momen di mana kamu merasa paling dicintai 💗",
  "Apa inside joke favorit kalian? 😆",
  "Kalau mendekorasi rumah bareng, gaya apa yang kalian pilih? 🏡",
  "Apa hal yang paling kamu tunggu-tunggu bersama pasangan? ⏳",
  "Sebutkan satu hal baru yang ingin kalian coba bersama 🆕",
  "Apa kata-kata pasanganmu yang paling membekas di hati? 💬",
  "Gambarkan hubungan kalian sebagai satu emoji! Yang mana? 😊",
];

const DailyLovePrompt = () => {
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const getPromptOfDay = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return LOVE_PROMPTS[dayOfYear % LOVE_PROMPTS.length];
  };

  const shufflePrompt = () => {
    const random = LOVE_PROMPTS[Math.floor(Math.random() * LOVE_PROMPTS.length)];
    setPrompt(random);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setPrompt(getPromptOfDay());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative bg-card rounded-md p-6 shadow-lg border border-border overflow-hidden"
    >
      {/* Decorative tape */}
      <div
        className="absolute -top-3 left-8 w-16 h-5 rounded-sm rotate-[-3deg]"
        style={{ background: "hsl(var(--tape) / 0.6)" }}
      />

      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-primary fill-primary" />
        <h3 className="font-handwritten text-xl text-foreground">Prompt Cinta Hari Ini</h3>
      </div>

      <p className="font-handwritten text-lg text-foreground/80 leading-relaxed mb-4">
        {prompt}
      </p>

      <div className="flex gap-2">
        <button
          onClick={shufflePrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Ganti
        </button>
        <button
          onClick={copyPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Tersalin!" : "Salin"}
        </button>
      </div>

      <span className="absolute bottom-2 right-3 text-2xl opacity-15 rotate-12">💘</span>
    </motion.div>
  );
};

export default DailyLovePrompt;
