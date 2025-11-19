import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import BIMCore from "./pages/BIMCore";
import Geographic from "./pages/Geographic";
import AI from "./pages/AI";
import Communications from "./pages/Communications";
import Empleabilidad from "./pages/Empleabilidad";
import ClashDetection from "./pages/ClashDetection";
import BEPManagement from "./pages/BEPManagement";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/bim"} component={BIMCore} />
      <Route path={"/geographic"} component={Geographic} />
      <Route path={"/ai"} component={AI} />
      <Route path={"/communications"} component={Communications} />
      <Route path={"/empleabilidad"} component={Empleabilidad} />
      <Route path={"/clash-detection"} component={ClashDetection} />
      <Route path={"/bep"} component={BEPManagement} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
