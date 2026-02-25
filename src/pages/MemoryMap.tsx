import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Plus, X, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CATEGORIES = [
  { value: "first_date", label: "First Date", emoji: "💑" },
  { value: "first_kiss", label: "First Kiss", emoji: "💋" },
  { value: "first_trip", label: "First Trip", emoji: "✈️" },
  { value: "favorite_spot", label: "Favorite Spot", emoji: "⭐" },
  { value: "anniversary", label: "Anniversary", emoji: "🎉" },
];

const getCategoryEmoji = (cat: string) => CATEGORIES.find(c => c.value === cat)?.emoji || "📍";
const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;

function createEmojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:28px;text-align:center;line-height:1;">${emoji}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
}

interface MemoryLocation {
  id: string;
  title: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  memory_date: string;
  user_id: string;
  couple_id: string;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const MemoryMap = () => {
  const [locations, setLocations] = useState<MemoryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("first_date");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [clickedPos, setClickedPos] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("memory_locations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load locations");
    else setLocations((data as MemoryLocation[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setClickedPos({ lat, lng });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickedPos) {
      toast.error("Tap pada peta untuk pilih lokasi");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("couple_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.couple_id) throw new Error("No couple found");

      const { error } = await supabase.from("memory_locations").insert({
        couple_id: profile.couple_id,
        user_id: user.id,
        title,
        description: description || null,
        category,
        latitude: clickedPos.lat,
        longitude: clickedPos.lng,
        memory_date: date,
      } as any);

      if (error) throw error;
      toast.success("Lokasi ditandai! 📍");
      resetForm();
      fetchLocations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("first_date");
    setDate(new Date().toISOString().split("T")[0]);
    setClickedPos(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("memory_locations").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Lokasi dihapus");
      fetchLocations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const center: [number, number] = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [-6.2, 106.8]; // Default Jakarta

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-foreground">Memory Map</h1>
              <p className="font-handwritten text-lg text-muted-foreground mt-1">tempat-tempat spesial kita 📍</p>
            </div>
            {showForm ? (
              <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-muted text-foreground font-handwritten text-lg hover:opacity-90 transition">
                <X className="w-4 h-4" /> Batal
              </button>
            ) : (
              <p className="font-handwritten text-sm text-muted-foreground">tap peta untuk tandai lokasi</p>
            )}
          </div>

          {/* Map */}
          <div className="scrapbook-card p-2 mb-8 relative">
            <div className="tape-strip -top-2.5 left-8 rotate-[-5deg]" />
            <div className="tape-strip -top-2.5 right-8 rotate-[3deg]" />
            <div className="rounded-sm overflow-hidden" style={{ height: "400px" }}>
              {!loading && (
                <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ClickHandler onClick={handleMapClick} />
                  {clickedPos && (
                    <Marker position={[clickedPos.lat, clickedPos.lng]} icon={createEmojiIcon("📌")} />
                  )}
                  {locations.map((loc) => (
                    <Marker
                      key={loc.id}
                      position={[loc.latitude, loc.longitude]}
                      icon={createEmojiIcon(getCategoryEmoji(loc.category))}
                    >
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold text-sm">{getCategoryEmoji(loc.category)} {loc.title}</p>
                          <p className="text-xs text-muted-foreground">{getCategoryLabel(loc.category)}</p>
                          {loc.description && <p className="text-xs mt-1">{loc.description}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{loc.memory_date}</p>
                          {loc.user_id === currentUserId && (
                            <button
                              onClick={() => setDeleteId(loc.id)}
                              className="mt-2 text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 mx-auto"
                            >
                              <Trash2 className="w-3 h-3" /> Hapus
                            </button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>

          {/* Form */}
          {showForm && clickedPos && (
            <div className="scrapbook-card p-6 mb-8">
              <div className="tape-strip -top-2.5 left-8 rotate-[-5deg]" />
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <p className="font-handwritten text-base text-muted-foreground">
                  📍 Lokasi: {clickedPos.lat.toFixed(4)}, {clickedPos.lng.toFixed(4)}
                </p>
                <input
                  type="text"
                  placeholder="Nama tempat..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <textarea
                  placeholder="Ceritakan kenangan di sini... (opsional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
                />
                <div className="flex gap-4 flex-wrap">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-3 rounded-sm bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-3 rounded-sm bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-sm bg-primary text-primary-foreground font-handwritten text-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "📌 Tandai lokasi ini"}
                </button>
              </form>
            </div>
          )}

          {/* Legend */}
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {CATEGORIES.map((cat) => {
                const count = locations.filter(l => l.category === cat.value).length;
                if (count === 0) return null;
                return (
                  <span key={cat.value} className="font-handwritten text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {cat.emoji} {cat.label} ({count})
                  </span>
                );
              })}
            </div>
          )}
        </main>
      </PageTransition>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus lokasi ini?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MemoryMap;
