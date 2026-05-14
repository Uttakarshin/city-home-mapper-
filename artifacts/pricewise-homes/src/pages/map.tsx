import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { MapPin } from "lucide-react";
import { useListProperties } from "@workspace/api-client-react";
import type { Property } from "@workspace/api-client-react";

export default function MapPage() {
  const [, setLocation] = useLocation();
  const { data: properties, isLoading } = useListProperties();
  const [selected, setSelected] = useState<Property | null>(null);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: React.ComponentType<any>;
    TileLayer: React.ComponentType<any>;
    Marker: React.ComponentType<any>;
    Popup: React.ComponentType<any>;
    icon: (opts: object) => object;
  } | null>(null);

  // Lazily load react-leaflet to avoid SSR issues
  useEffect(() => {
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
      // @ts-ignore
      import("leaflet/dist/leaflet.css"),
    ]).then(([rl, L]) => {
      // Fix default icon paths for webpack/vite bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer:    rl.TileLayer,
        Marker:       rl.Marker,
        Popup:        rl.Popup,
        icon:         (opts) => L.icon(opts as any),
      });
    });
  }, []);

  const formatPrice = (p: number) => {
    if (p >= 1_00_00_000) return `₹${(p / 1_00_00_000).toFixed(1)} Cr`;
    if (p >= 1_00_000)    return `₹${(p / 1_00_000).toFixed(0)} L`;
    return `₹${p.toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 py-3 border-b border-border bg-card flex items-center gap-3">
        <MapPin size={18} className="text-primary" />
        <h1 className="font-serif text-xl font-bold">Property Map</h1>
        {!isLoading && properties && (
          <span className="text-sm text-muted-foreground ml-auto">
            {properties.length} listings
          </span>
        )}
      </div>

      <div className="flex-1 relative">
        {isLoading || !MapComponents ? (
          <div className="h-full flex items-center justify-center bg-muted">
            <div className="text-muted-foreground text-sm">Loading map…</div>
          </div>
        ) : (
          <MapComponents.MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <MapComponents.TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {(properties ?? []).map((p) => (
              <MapComponents.Marker
                key={p.id}
                position={[Number(p.lat), Number(p.lng)]}
                eventHandlers={{ click: () => setSelected(p) }}
              >
                <MapComponents.Popup>
                  <div className="min-w-[180px]">
                    <div className="font-semibold text-sm">{p.title}</div>
                    <div className="text-xs text-gray-600 mb-1">{p.city}</div>
                    <div className="text-primary font-bold text-sm">
                      {formatPrice(Number(p.price))}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p.bedrooms} bd · {p.bathrooms} ba · {p.sqft} sqft
                    </div>
                    <button
                      onClick={() => setLocation(`/property/${p.id}`)}
                      className="mt-2 w-full text-xs bg-primary text-white py-1 rounded font-medium hover:bg-primary/90 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </MapComponents.Popup>
              </MapComponents.Marker>
            ))}
          </MapComponents.MapContainer>
        )}
      </div>
    </div>
  );
}
