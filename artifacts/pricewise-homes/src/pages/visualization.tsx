import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Users, Building2, MapPin, Home, Info } from "lucide-react";
import { CITIES, type CityData } from "@/data/cities";
import HouseVisualization from "@/components/house-visualization";

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}

function StatCard({ icon: Icon, label, value, subtext, color = "text-primary" }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2">
      <div className={`flex items-center gap-2 text-sm font-medium text-muted-foreground`}>
        <Icon size={16} className={color} />
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
    </div>
  );
}

function BarMeter({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function VisualizationPage() {
  const [selectedCityName, setSelectedCityName] = useState<string>(CITIES[0].name);
  const city: CityData = CITIES.find((c) => c.name === selectedCityName) ?? CITIES[0];

  const formatPrice = (lakhs: number) => `₹${lakhs} L`;
  const formatPop = (m: number) => `${m.toFixed(1)} M`;

  // Normalised values for progress bars (against the max in the dataset)
  const maxPrice   = Math.max(...CITIES.map((c) => c.avgHousePrice));
  const maxPop     = Math.max(...CITIES.map((c) => c.population));
  const maxGrowth  = Math.max(...CITIES.map((c) => c.growthRate));
  const maxArea    = Math.max(...CITIES.map((c) => c.areaSize));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <BarChart3 size={14} />
          City Data Visualizer
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          Indian Cities Housing Data
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Select a city to explore its real estate landscape. The house graphic dynamically adjusts
          its size, windows, roof, and yard based on the city's data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left panel — controls + stats */}
        <div className="lg:col-span-2 space-y-5">
          {/* City selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              Select a City
            </label>
            <select
              value={selectedCityName}
              onChange={(e) => setSelectedCityName(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card outline-none focus:ring-2 focus:ring-primary/30 font-medium"
              data-testid="city-selector"
            >
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} — {c.state}
                </option>
              ))}
            </select>
          </div>

          {/* City statistics */}
          <AnimatePresence mode="wait">
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Building2}
                  label="Avg House Price"
                  value={formatPrice(city.avgHousePrice)}
                  subtext="Indian Rupees (Lakhs)"
                  color="text-amber-600"
                />
                <StatCard
                  icon={Users}
                  label="Population"
                  value={formatPop(city.population)}
                  subtext="City metro area"
                  color="text-blue-600"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Growth Rate"
                  value={`${city.growthRate}%`}
                  subtext="Annual property growth"
                  color="text-emerald-600"
                />
                <StatCard
                  icon={MapPin}
                  label="City Area"
                  value={`${city.areaSize} km²`}
                  subtext="Total land area"
                  color="text-violet-600"
                />
              </div>

              {/* Progress bars */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Info size={14} className="text-muted-foreground" />
                  Relative to All Cities
                </h3>
                <BarMeter value={city.avgHousePrice} max={maxPrice}  label="House Price"  color="#d97706" />
                <BarMeter value={city.population}    max={maxPop}    label="Population"   color="#2563eb" />
                <BarMeter value={city.growthRate}    max={maxGrowth} label="Growth Rate"  color="#16a34a" />
                <BarMeter value={city.areaSize}      max={maxArea}   label="City Area"    color="#7c3aed" />
              </div>

              {/* Visual legend */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
                <p className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                  <Home size={13} />
                  House Visual Guide
                </p>
                <p>🏠 <strong>House size</strong> — avg house price (larger = pricier)</p>
                <p>🪟 <strong>Windows</strong> — population (more windows = bigger city)</p>
                <p>🏔️ <strong>Roof steepness</strong> — growth rate (steeper = faster growth)</p>
                <p>🌿 <strong>Yard width</strong> — city area (wider = larger city)</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right panel — SVG house */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-b from-sky-50 to-green-50 border border-border rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-foreground">
                {city.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">· {city.state}</span>
              </h2>
              <span className="text-xs bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">
                Live Visualization
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="flex-1 flex items-center justify-center"
                data-testid="house-visualization"
              >
                <HouseVisualization city={city} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* City comparison table */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl font-bold mb-4">All Cities Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 font-semibold text-muted-foreground">City</th>
                <th className="text-left py-3 px-3 font-semibold text-muted-foreground">State</th>
                <th className="text-right py-3 px-3 font-semibold text-muted-foreground">Avg Price (L)</th>
                <th className="text-right py-3 px-3 font-semibold text-muted-foreground">Population (M)</th>
                <th className="text-right py-3 px-3 font-semibold text-muted-foreground">Growth %</th>
                <th className="text-right py-3 px-3 font-semibold text-muted-foreground">Area (km²)</th>
              </tr>
            </thead>
            <tbody>
              {CITIES.sort((a, b) => b.avgHousePrice - a.avgHousePrice).map((c) => (
                <tr
                  key={c.name}
                  onClick={() => setSelectedCityName(c.name)}
                  className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-accent/50 ${
                    c.name === city.name ? "bg-primary/5 font-medium" : ""
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className={c.name === city.name ? "text-primary" : ""}>{c.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.state}</td>
                  <td className="py-2.5 px-3 text-right">₹{c.avgHousePrice}</td>
                  <td className="py-2.5 px-3 text-right">{c.population}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700">{c.growthRate}%</td>
                  <td className="py-2.5 px-3 text-right">{c.areaSize.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
