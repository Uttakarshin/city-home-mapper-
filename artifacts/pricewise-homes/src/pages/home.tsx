import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Home, TrendingUp, MapPin, ArrowRight, BarChart3 } from "lucide-react";
import { useGetFeaturedProperties, useGetPropertyStats } from "@workspace/api-client-react";
import PropertyCard from "@/components/property-card";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { data: featured, isLoading: featLoading } = useGetFeaturedProperties();
  const { data: stats } = useGetPropertyStats();

  const statItems = stats
    ? [
        { label: "Total Listings", value: stats.totalListings.toString(), icon: Home },
        {
          label: "Avg Price",
          value: `₹${(stats.avgPrice / 1_00_000).toFixed(0)}L`,
          icon: TrendingUp,
        },
        { label: "Avg Area", value: `${Math.round(stats.avgSqft)} sqft`, icon: BarChart3 },
        { label: "Cities", value: stats.cityBreakdown.length.toString(), icon: MapPin },
      ]
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white py-24 px-6">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600')] bg-cover bg-center" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-5xl md:text-6xl font-bold mb-4"
          >
            Find Your{" "}
            <span className="text-amber-300">Dream Home</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-stone-300 text-xl mb-10 max-w-2xl mx-auto"
          >
            Discover thousands of premium properties across India's most vibrant cities.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20"
          >
            <Search size={20} className="text-amber-300 shrink-0" />
            <input
              type="text"
              placeholder="Search by city, neighbourhood..."
              className="flex-1 bg-transparent text-white placeholder:text-stone-400 outline-none text-sm"
              onKeyDown={(e) => e.key === "Enter" && setLocation("/listings")}
            />
            <button
              onClick={() => setLocation("/listings")}
              className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors"
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      {statItems.length > 0 && (
        <section className="border-b border-border bg-card">
          <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="text-center"
              >
                <Icon size={20} className="text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured properties */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground">Featured Properties</h2>
            <p className="text-muted-foreground mt-1">Handpicked premium listings just for you</p>
          </div>
          <button
            onClick={() => setLocation("/listings")}
            className="flex items-center gap-1.5 text-primary font-medium text-sm hover:underline"
          >
            View all <ArrowRight size={15} />
          </button>
        </div>

        {featLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-72 animate-pulse border border-border" />
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Home size={40} className="mx-auto mb-3 opacity-30" />
            <p>No featured properties yet.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-amber-50 to-stone-100 border-y border-border py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-3">Explore the City Data Visualizer</h2>
          <p className="text-muted-foreground mb-6">
            See how house prices, population, and growth rates compare across 22+ Indian cities — visualised as a living house.
          </p>
          <button
            onClick={() => setLocation("/visualization")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Open City Visualizer
          </button>
        </div>
      </section>
    </div>
  );
}
