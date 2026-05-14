import { useState } from "react";
import { useLocation } from "wouter";
import { Home, List, Map, Heart, Sparkles, BarChart3, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/",             label: "Home",         icon: Home       },
  { href: "/listings",     label: "Listings",     icon: List       },
  { href: "/map",          label: "Map",          icon: Map        },
  { href: "/favorites",    label: "Favorites",    icon: Heart      },
  { href: "/visualize",    label: "AI Visualize", icon: Sparkles   },
  { href: "/visualization",label: "City Data",    icon: BarChart3  },
];

export default function Nav() {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const navigate = (href: string) => {
    setLocation(href);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-serif font-bold text-xl text-primary hover:opacity-80 transition-opacity"
            data-testid="nav-logo"
          >
            <Home size={22} className="text-primary" />
            <span>PriceWise</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = location === href || (href !== "/" && location.startsWith(href));
              return (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            data-testid="nav-mobile-toggle"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = location === href || (href !== "/" && location.startsWith(href));
                return (
                  <button
                    key={href}
                    onClick={() => navigate(href)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
