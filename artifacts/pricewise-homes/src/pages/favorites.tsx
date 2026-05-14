import { Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useListFavorites } from "@workspace/api-client-react";
import PropertyCard from "@/components/property-card";

export default function FavoritesPage() {
  const [, setLocation] = useLocation();
  const { data: favorites, isLoading } = useListFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Heart size={22} className="text-red-500" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Saved Properties</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isLoading ? "Loading..." : `${favorites?.length ?? 0} saved properties`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-64 animate-pulse border border-border" />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="font-serif text-2xl font-bold mb-2">No saved properties yet</h2>
          <p className="text-muted-foreground mb-6">
            Click the heart icon on any property to save it here.
          </p>
          <button
            onClick={() => setLocation("/listings")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Browse Listings
          </button>
        </div>
      )}
    </div>
  );
}
