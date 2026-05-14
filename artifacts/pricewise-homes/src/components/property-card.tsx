import { useLocation } from "wouter";
import { Bed, Bath, Maximize2, Heart, MapPin } from "lucide-react";
import { useAddFavorite, useRemoveFavorite } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListFavoritesQueryKey, getListPropertiesQueryKey } from "@workspace/api-client-react";
import type { Property } from "@workspace/api-client-react";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const addFavorite = useAddFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
      },
    },
  });
  const removeFavorite = useRemoveFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
      },
    },
  });

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.isFavorited) {
      removeFavorite.mutate({ propertyId: property.id });
    } else {
      addFavorite.mutate({ propertyId: property.id });
    }
  };

  const formatPrice = (p: number) => {
    if (p >= 1_00_00_000) return `₹${(p / 1_00_00_000).toFixed(1)} Cr`;
    if (p >= 1_00_000) return `₹${(p / 1_00_000).toFixed(0)} L`;
    return `₹${p.toLocaleString("en-IN")}`;
  };

  return (
    <div
      className="group cursor-pointer bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200"
      onClick={() => setLocation(`/property/${property.id}`)}
      data-testid={`property-card-${property.id}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-amber-100">
            <span className="text-4xl">🏠</span>
          </div>
        )}

        {/* Badge */}
        {property.isFeatured && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
        <span className="absolute top-3 right-14 bg-white/90 text-foreground text-xs font-medium px-2 py-1 rounded-full capitalize">
          {property.propertyType}
        </span>

        {/* Favorite */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
          aria-label={property.isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={16}
            className={property.isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="font-semibold text-foreground text-base truncate mb-1">{property.title}</div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <MapPin size={12} />
          <span className="truncate">{property.address}, {property.city}</span>
        </div>

        {/* Price */}
        <div className="text-primary font-bold text-lg mb-3">
          {formatPrice(Number(property.price))}
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1">
            <Bed size={13} />
            {property.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1">
            <Bath size={13} />
            {property.bathrooms} Baths
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={13} />
            {property.sqft.toLocaleString()} sqft
          </span>
        </div>
      </div>
    </div>
  );
}
