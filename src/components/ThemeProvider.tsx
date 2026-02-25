import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ThemeName = "romantic-rose" | "nature-memory" | "ocean-dream" | "midnight-vintage";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "romantic-rose",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_CLASSES: ThemeName[] = ["romantic-rose", "nature-memory", "ocean-dream", "midnight-vintage"];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>("romantic-rose");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("profiles")
        .select("theme")
        .eq("user_id", session.user.id)
        .single();
      if (data?.theme) {
        applyTheme(data.theme as ThemeName);
      }
    };
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("theme")
          .eq("user_id", session.user.id)
          .single();
        if (data?.theme) {
          applyTheme(data.theme as ThemeName);
        }
      } else {
        applyTheme("romantic-rose");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const applyTheme = (t: ThemeName) => {
    THEME_CLASSES.forEach((c) => document.body.classList.remove(`theme-${c}`));
    document.body.classList.add(`theme-${t}`);
    setThemeState(t);
  };

  const setTheme = (t: ThemeName) => {
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
