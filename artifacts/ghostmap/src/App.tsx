import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import MapPage from "@/pages/MapPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ProfilePage from "@/pages/ProfilePage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={MapPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
