import { useState } from "react";
import {
  Sparkles, Loader2, History, BedDouble, Bath,
  Building2, Palette, MapPin, ChevronRight, Star, ArrowLeft, ExternalLink,
} from "lucide-react";
import { useGenerateVisualization, useListVisualizations, getListVisualizationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STYLES = ["Modern", "Colonial", "Mediterranean", "Victorian", "Contemporary", "Minimalist", "Craftsman", "Art Deco"];
const COLORS = ["White", "Beige", "Grey", "Blue", "Green", "Terracotta", "Cream", "Sand"];
const SURROUNDINGS = ["Urban street", "Suburban neighbourhood", "Countryside", "Waterfront", "Mountain view", "Garden oasis"];

function parseImages(imageBase64: string): string[] {
  try {
    const parsed = JSON.parse(imageBase64);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [imageBase64];
}

interface ResultCardProps {
  item: {
    id: number;
    prompt: string;
    style?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    stories?: number | null;
    exteriorColor?: string | null;
    surroundings?: string | null;
    imageBase64: string;
    createdAt: string;
  };
  onSelect: () => void;
}

function ResultCard({ item, onSelect }: ResultCardProps) {
  const images = parseImages(item.imageBase64);
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer group" onClick={onSelect}>
        <img
          src={images[activeImg]}
          alt={item.prompt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const next = activeImg + 1;
            if (next < images.length) setActiveImg(next);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.slice(0, 6).map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? "bg-white w-4" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star size={10} fill="currentColor" /> Dream Home
          </span>
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto scrollbar-hide">
          {images.slice(0, 6).map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        <p className="text-sm font-semibold line-clamp-2 mb-2">{item.prompt}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.style && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              <Building2 size={10} />{item.style}
            </span>
          )}
          {item.bedrooms && (
            <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              <BedDouble size={10} />{item.bedrooms} Bed
            </span>
          )}
          {item.bathrooms && (
            <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              <Bath size={10} />{item.bathrooms} Bath
            </span>
          )}
          {item.surroundings && (
            <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              <MapPin size={10} />{item.surroundings}
            </span>
          )}
          {item.exteriorColor && (
            <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              <Palette size={10} />{item.exteriorColor}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}

interface FullViewProps {
  item: ResultCardProps["item"];
  onBack: () => void;
}

function FullView({ item, onBack }: FullViewProps) {
  const images = parseImages(item.imageBase64);
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <img src={images[active]} alt={item.prompt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Star size={11} fill="currentColor" /> Dream Home Concept
            </span>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    i === active ? "border-primary shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-1">Your Dream Home</h2>
            <p className="text-muted-foreground text-sm">{item.prompt}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {item.style && (
              <div className="bg-muted/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Building2 size={12} /> Style</div>
                <p className="font-semibold text-sm">{item.style}</p>
              </div>
            )}
            {item.bedrooms && (
              <div className="bg-muted/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><BedDouble size={12} /> Bedrooms</div>
                <p className="font-semibold text-sm">{item.bedrooms}</p>
              </div>
            )}
            {item.bathrooms && (
              <div className="bg-muted/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Bath size={12} /> Bathrooms</div>
                <p className="font-semibold text-sm">{item.bathrooms}</p>
              </div>
            )}
            {item.stories && (
              <div className="bg-muted/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Building2 size={12} /> Stories</div>
                <p className="font-semibold text-sm">{item.stories}</p>
              </div>
            )}
            {item.exteriorColor && (
              <div className="bg-muted/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Palette size={12} /> Exterior Colour</div>
                <p className="font-semibold text-sm">{item.exteriorColor}</p>
              </div>
            )}
            {item.surroundings && (
              <div className="bg-muted/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><MapPin size={12} /> Surroundings</div>
                <p className="font-semibold text-sm">{item.surroundings}</p>
              </div>
            )}
          </div>

          <a
            href={`https://www.google.com/search?q=${encodeURIComponent((item.style ?? "modern") + " " + (item.surroundings ?? "") + " house exterior India")}&tbm=isch`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full justify-center border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <ExternalLink size={14} /> Search More on Google Images
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VisualizePage() {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");
  const [stories, setStories] = useState<number | "">("");
  const [exteriorColor, setExteriorColor] = useState("");
  const [surroundings, setSurroundings] = useState("");
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: history, isLoading: histLoading } = useListVisualizations();

  const generate = useGenerateVisualization({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVisualizationsQueryKey() });
        setSelectedId(null);
        setActiveTab("history");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    generate.mutate({
      data: {
        prompt,
        ...(style          && { style }),
        ...(bedrooms !== ""  && { bedrooms: Number(bedrooms) }),
        ...(bathrooms !== "" && { bathrooms: Number(bathrooms) }),
        ...(stories !== ""   && { stories: Number(stories) }),
        ...(exteriorColor  && { exteriorColor }),
        ...(surroundings   && { surroundings }),
      },
    });
  };

  const selectedItem = selectedId != null ? history?.find((v) => v.id === selectedId) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Sparkles size={14} /> Dream Home Finder
        </div>
        <h1 className="font-serif text-4xl font-bold mb-2">Visualize Your Dream Home</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Describe your ideal home and we'll show you real matching house photos to inspire your search.
        </p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit mb-8">
        {(["generate", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedId(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "generate" ? (
              <span className="flex items-center gap-1.5"><Sparkles size={13} /> Generate</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <History size={13} /> My Visions
                {history && history.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {history.length}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "generate" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Describe your dream home *</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A spacious 4-bedroom villa with a pool, modern kitchen, open living area, and a beautiful garden in Goa…"
                rows={4}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Style", icon: <Building2 size={13}/>, value: style, onChange: setStyle,
                  options: STYLES.map(s => ({ v: s, l: s })), placeholder: "Any style" },
                { label: "Exterior Colour", icon: <Palette size={13}/>, value: exteriorColor, onChange: setExteriorColor,
                  options: COLORS.map(c => ({ v: c, l: c })), placeholder: "Any colour" },
                { label: "Surroundings", icon: <MapPin size={13}/>, value: surroundings, onChange: setSurroundings,
                  options: SURROUNDINGS.map(s => ({ v: s, l: s })), placeholder: "Any setting" },
              ].map(({ label, icon, value, onChange, options, placeholder }) => (
                <div key={label}>
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1.5">{icon}{label}</label>
                  <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">{placeholder}</option>
                    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1.5"><BedDouble size={13}/>Bedrooms</label>
                <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : "")}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Any</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1.5"><Bath size={13}/>Bathrooms</label>
                <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : "")}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Any</option>
                  {[1,1.5,2,2.5,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generate.isPending || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {generate.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Finding your dream home…</>
              ) : (
                <><Sparkles size={18} /> Show Me My Dream Home <ChevronRight size={16}/></>
              )}
            </button>
            {generate.error && (
              <p className="text-sm text-destructive text-center">Something went wrong. Please try again.</p>
            )}
          </form>

          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Example Prompts</p>
            {[
              { emoji: "🏖️", text: "Luxury beachfront villa in Goa with an infinity pool and panoramic sea views" },
              { emoji: "🌿", text: "Eco-friendly 3-bedroom cottage in Coorg with wooden interiors and a garden" },
              { emoji: "🏙️", text: "Modern penthouse in Mumbai with floor-to-ceiling windows and city views" },
              { emoji: "🏰", text: "Colonial-style bungalow in Chennai with a wrap-around verandah and lush garden" },
            ].map(({ emoji, text }) => (
              <button
                key={text}
                onClick={() => setPrompt(text)}
                className="w-full text-left text-sm bg-muted/50 hover:bg-muted rounded-xl p-3.5 transition-colors border border-border/50"
              >
                <span className="mr-2">{emoji}</span>{text}
              </button>
            ))}
          </div>
        </div>
      ) : selectedItem ? (
        <FullView item={selectedItem as any} onBack={() => setSelectedId(null)} />
      ) : (
        <div>
          {histLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...history].reverse().map((v) => (
                <ResultCard
                  key={v.id}
                  item={v as any}
                  onSelect={() => setSelectedId(v.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-primary opacity-60" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No visions yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Generate your first dream home visualization to see it here.</p>
              <button
                onClick={() => setActiveTab("generate")}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Sparkles size={15} /> Start Visualizing
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
