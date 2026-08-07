import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { AppConfig } from "@shared/schema";
import PasscodeGate from "@/components/PasscodeGate";
import SetupScreen from "@/components/SetupScreen";
import Spinner from "@/components/Spinner";
import Dashboard from "@/pages/Dashboard";
import DealAnalytics from "@/pages/DealAnalytics";
import DealEditor from "@/pages/DealEditor";
import DesignSystem from "@/pages/DesignSystem";
import Landing from "@/pages/Landing";
import PublicDeal from "@/pages/PublicDeal";

function Admin({ config, children }: { config: AppConfig; children: ReactNode }) {
  if (!config.adminRequired) return <>{children}</>;
  return <PasscodeGate>{children}</PasscodeGate>;
}

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig({ configured: false, adminRequired: false }));
  }, []);

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!config.configured) return <SetupScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/design" element={<DesignSystem />} />
        <Route
          path="/dashboard"
          element={
            <Admin config={config}>
              <Dashboard />
            </Admin>
          }
        />
        <Route
          path="/dashboard/new"
          element={
            <Admin config={config}>
              <DealEditor />
            </Admin>
          }
        />
        <Route
          path="/dashboard/:id/edit"
          element={
            <Admin config={config}>
              <DealEditor />
            </Admin>
          }
        />
        <Route
          path="/dashboard/:id/analytics"
          element={
            <Admin config={config}>
              <DealAnalytics />
            </Admin>
          }
        />
        <Route path="/deal/:slug" element={<PublicDeal />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
