import { useState } from "react";
import { Sparkles, Loader2, Download, History } from "lucide-react";
import { useGenerateVisualization, useListVisualizations } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListVisualizationsQueryKey } from "@workspace/api-client-react";

const STYLES = ["Modern", "Colonial", "Mediterranean", "Victorian", "Contemporary", "Minimalist", "Craftsman", "Art Deco"];
const COLORS = ["White", "Beige", "Grey", "Blue", "Green", "Terracotta", "Cream", "Sand"];
const SURROUNDINGS = ["Urban street", "Suburban neighbourhood", "Countryside", "Waterfront", "Mountain view", "Garden oasis"];

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

  const { data: history, isLoading: histLoading } = useListVisualizations();

  const generate = useGenerateVisualization({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVisualizationsQueryKey() });
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

  const downloadImage = (b64: string, id: number) => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${b64}`;
    a.download = `home-vision-${id}.png`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Sparkles size={14} />
          AI-Powered Home Visualizer
        </div>
        <h1 className="font-serif text-4xl font-bold mb-2">Visualize Your Dream Home</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Describe your ideal home and our AI will generate a stunning visual concept just for you.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit mb-8">
        {(["generate", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "generate" ? (
              <span className="flex items-center gap-1.5"><Sparkles size={13} /> Generate</span>
            ) : (
              <span className="flex items-center gap-1.5"><History size={13} /> History</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "generate" ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">Describe your dream home *</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A spacious 3-bedroom family home with a large garden, modern kitchen, and open plan living area…"
              rows={3}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              required
            />
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any style</option>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : "")}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bathrooms</label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : "")}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any</option>
                {[1, 1.5, 2, 2.5, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Stories</label>
              <select
                value={stories}
                onChange={(e) => setStories(e.target.value ? Number(e.target.value) : "")}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any</option>
                {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Exterior Colour</label>
              <select
                value={exteriorColor}
                onChange={(e) => setExteriorColor(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any colour</option>
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Surroundings</label>
              <select
                value={surroundings}
                onChange={(e) => setSurroundings(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any setting</option>
                {SURROUNDINGS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={generate.isPending || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generate.isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Generating…</>
            ) : (
              <><Sparkles size={18} /> Generate My Dream Home</>
            )}
          </button>

          {generate.error && (
            <p className="text-sm text-destructive text-center">
              Generation failed. Please try again.
            </p>
          )}
        </form>
      ) : (
        <div>
          {histLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {history.map((v) => (
                <div key={v.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="relative">
                    <img
                      src={v.imageBase64}
                      alt={v.prompt}
                      className="w-full h-56 object-cover"
                    />
                    <button
                      onClick={() => downloadImage(v.imageBase64, v.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-lg transition-colors"
                      title="Download image"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium line-clamp-2">{v.prompt}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {v.style && (
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{v.style}</span>
                      )}
                      {v.bedrooms && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{v.bedrooms} bd</span>
                      )}
                      {v.bathrooms && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{v.bathrooms} ba</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(v.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No visualizations yet. Generate one above!</p>
              <button
                onClick={() => setActiveTab("generate")}
                className="mt-4 text-primary text-sm hover:underline"
              >
                Go to Generator
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
