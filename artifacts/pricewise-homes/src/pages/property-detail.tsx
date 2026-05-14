import { useParams, useLocation } from "wouter";
import { ArrowLeft, Bed, Bath, Maximize2, Heart, MapPin, Calendar, Home } from "lucide-react";
import { useGetProperty, useAddFavorite, useRemoveFavorite } from "@workspace/api-client-react";
import { getListFavoritesQueryKey, getGetPropertyQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const id = Number(params.id);

  const { data: property, isLoading, error } = useGetProperty(id);

  const addFavorite = useAddFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPropertyQueryKey(id) });
      },
    },
  });
  const removeFavorite = useRemoveFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPropertyQueryKey(id) });
      },
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-72 bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-muted animate-pulse rounded-xl" />
          <div className="h-20 bg-muted animate-pulse rounded-xl" />
          <div className="h-20 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <Home size={40} className="mx-auto mb-3 text-muted-foreground opacity-40" />
        <h2 className="font-serif text-2xl font-bold mb-2">Property Not Found</h2>
        <button
          onClick={() => setLocation("/listings")}
          className="text-primary hover:underline text-sm"
        >
          Back to listings
        </button>
      </div>
    );
  }

  const formatPrice = (p: number) => {
    if (p >= 1_00_00_000) return `₹${(p / 1_00_00_000).toFixed(2)} Cr`;
    if (p >= 1_00_000)    return `₹${(p / 1_00_000).toFixed(1)} L`;
    return `₹${p.toLocaleString("en-IN")}`;
  };

  const toggleFavorite = () => {
    if (property.isFavorited) {
      removeFavorite.mutate({ propertyId: property.id });
    } else {
      addFavorite.mutate({ propertyId: property.id });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => setLocation("/listings")}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Listings
      </button>

      {/* Image */}
      <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-muted mb-6">
        {property.imageUrl ? (
          <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-amber-100">
            <span className="text-6xl">🏠</span>
          </div>
        )}
        {property.isFeatured && (
          <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif text-3xl font-bold text-foreground">{property.title}</h1>
              <button
                onClick={toggleFavorite}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium shrink-0"
              >
                <Heart
                  size={16}
                  className={property.isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}
                />
                {property.isFavorited ? "Saved" : "Save"}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
              <MapPin size={15} />
              <span>{property.address}, {property.city}, {property.state}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Bed,      label: "Bedrooms",  value: property.bedrooms      },
              { icon: Bath,     label: "Bathrooms", value: property.bathrooms     },
              { icon: Maximize2,label: "Sq Ft",     value: `${property.sqft.toLocaleString()} sqft` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
                <Icon size={20} className="text-primary mx-auto mb-1" />
                <div className="text-lg font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="font-semibold text-lg mb-2">About this property</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div>
            <h2 className="font-semibold text-lg mb-3">Property Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Type",        value: property.propertyType    },
                { label: "City",        value: property.city            },
                { label: "State",       value: property.state           },
                { label: "ZIP Code",    value: property.zipCode ?? "—"  },
                { label: "Year Built",  value: property.yearBuilt ?? "—"},
                { label: "Listed",      value: new Date(property.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium capitalize">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-3xl font-bold text-primary mb-1">
              {formatPrice(Number(property.price))}
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              ₹{Math.round(Number(property.price) / property.sqft).toLocaleString("en-IN")}/sqft
            </div>
            <button
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm mb-2"
            >
              Contact Agent
            </button>
            <button
              onClick={toggleFavorite}
              className={`w-full py-3 rounded-xl font-semibold text-sm border transition-colors ${
                property.isFavorited
                  ? "border-red-300 text-red-600 hover:bg-red-50"
                  : "border-border text-foreground hover:bg-accent"
              }`}
            >
              {property.isFavorited ? "♥ Saved" : "♡ Save Property"}
            </button>
          </div>

          {/* Location card */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Location
            </h3>
            <p className="text-sm text-muted-foreground">{property.address}</p>
            <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
            {property.zipCode && (
              <p className="text-sm text-muted-foreground">{property.zipCode}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {Number(property.lat).toFixed(4)}°N, {Number(property.lng).toFixed(4)}°E
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
