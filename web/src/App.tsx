import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavRail } from "./components/NavRail";
import { Fleet } from "./pages/Fleet";
import { Onboarding } from "./pages/Onboarding";
import { Login } from "./pages/Login";
import { Settings } from "./pages/Settings";
import { StubPage } from "./pages/Stub";
import { useConsoleWs } from "./hooks/useConsoleWs";
import { getToken, extractTokenFromUrl } from "./lib/auth";
import { fetchMe } from "./lib/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5_000,
    },
  },
});

function Shell() {
  useConsoleWs();

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={
          <div style={{ display: "flex", width: "100%", height: "100%" }}>
            <Onboarding />
          </div>
        }
      />
      <Route
        path="*"
        element={
          <div style={{ display: "flex", width: "100%", height: "100%" }}>
            <NavRail />
            <Routes>
              <Route path="/" element={<Fleet />} />
              <Route
                path="/analytics"
                element={
                  <StubPage
                    title="Analytics"
                    icon="chart"
                    description="Cost and usage analytics — coming soon."
                  />
                }
              />
              <Route
                path="/health"
                element={
                  <StubPage
                    title="Health"
                    icon="pulse"
                    description="Connection and uptime monitoring — coming soon."
                  />
                }
              />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        }
      />
    </Routes>
  );
}

function AuthGate() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function check() {
      // Check for token in URL (Google OAuth redirect)
      extractTokenFromUrl();

      const token = getToken();
      if (!token) {
        setReady(true);
        return;
      }

      // Validate the token
      const me = await fetchMe();
      setAuthenticated(!!me);
      setReady(true);
    }
    check();
  }, []);

  if (!ready) return null;
  if (!authenticated) return <Login />;
  return <Shell />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
