import { useEffect, useState } from "react";
import type { DriverIdentity } from "@/hooks/use-driver";
import { apiRequest } from "@/lib/queryClient";
import type { DriverSessionWithInspection } from "@shared/schema";
import GetStarted from "@/pages/GetStarted";
import VehicleInspection from "@/pages/VehicleInspection";
import ClockedIn from "@/pages/ClockedIn";

type Step = "loading" | "get-started" | "inspection" | "clocked-in";

export default function DriverApp({ driver, onLogout }: { driver: DriverIdentity; onLogout: () => void }) {
  const [step, setStep] = useState<Step>("loading");
  const [session, setSession] = useState<DriverSessionWithInspection | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest<DriverSessionWithInspection | null>("GET", `/api/drivers/${driver.id}/session`)
      .then((active) => {
        if (cancelled) return;
        if (active) {
          setSession(active);
          setStep("clocked-in");
        } else {
          setStep("get-started");
        }
      })
      .catch(() => !cancelled && setStep("get-started"));
    return () => {
      cancelled = true;
    };
  }, [driver.id]);

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (step === "get-started") {
    return <GetStarted driver={driver} onLogout={onLogout} onBeginShift={() => setStep("inspection")} />;
  }

  if (step === "inspection") {
    return (
      <VehicleInspection
        driver={driver}
        onBack={() => setStep("get-started")}
        onClockedIn={(s) => {
          setSession(s);
          setStep("clocked-in");
        }}
      />
    );
  }

  return (
    <ClockedIn
      driver={driver}
      session={session}
      onClockedOut={() => {
        setSession(null);
        setStep("get-started");
      }}
      onLogout={onLogout}
    />
  );
}
