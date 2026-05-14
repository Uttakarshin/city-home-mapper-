import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Nav from "@/components/nav";
import HomePage from "@/pages/home";
import ListingsPage from "@/pages/listings";
import MapPage from "@/pages/map";
import PropertyDetailPage from "@/pages/property-detail";
import FavoritesPage from "@/pages/favorites";
import VisualizePage from "@/pages/visualize";
import VisualizationPage from "@/pages/visualization";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/listings" component={ListingsPage} />
          <Route path="/map" component={MapPage} />
          <Route path="/property/:id" component={PropertyDetailPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/visualize" component={VisualizePage} />
          <Route path="/visualization" component={VisualizationPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
