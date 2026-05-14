import { useLocation } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <Home size={48} className="text-muted-foreground mb-4 opacity-30" />
      <h1 className="font-serif text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => setLocation("/")}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
      >
        Go Home
      </button>
    </div>
  );
}
