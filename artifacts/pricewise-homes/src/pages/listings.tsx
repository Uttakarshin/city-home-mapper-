import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useListProperties } from "@workspace/api-client-react";
import PropertyCard from "@/components/property-card";

type Filters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
};

const PROPERTY_TYPES = ["house", "condo", "townhouse", "apartment"];
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const query: Record<string, string | number> = {};
  if (filters.city)         query.city = filters.city;
  if (filters.minPrice)     query.minPrice = filters.minPrice;
  if (filters.maxPrice)     query.maxPrice = filters.maxPrice;
  if (filters.bedrooms)     query.bedrooms = filters.bedrooms;
  if (filters.propertyType) query.propertyType = filters.propertyType;

  const { data: properties, isLoading } = useListProperties(
    Object.keys(query).length ? query : undefined
  );

  const filtered = (properties ?? []).filter((p) =>
    search
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const clearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const hasFilters = Object.keys(filters).length > 0 || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">All Listings</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading ? "Loading..." : `${filtered.length} properties found`}
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-card">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by title, city, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
            showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-accent"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-card border border-border rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={filters.city ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value || undefined }))}
              className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property Type</label>
            <select
              value={filters.propertyType ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value || undefined }))}
              className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Min Bedrooms</label>
            <select
              value={filters.bedrooms ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, bedrooms: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Any</option>
              {BEDROOM_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Max Price (₹L)</label>
            <input
              type="number"
              placeholder="e.g. 200"
              value={filters.maxPrice ? filters.maxPrice / 1_00_000 : ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  maxPrice: e.target.value ? Number(e.target.value) * 1_00_000 : undefined,
                }))
              }
              className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-64 animate-pulse border border-border" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No properties found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}
