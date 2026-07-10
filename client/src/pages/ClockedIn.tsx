import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/queryClient";
import type { DriverIdentity } from "@/hooks/use-driver";
import type { DriverSessionWithInspection, DriverSession } from "@shared/schema";

export default function ClockedIn({
  driver,
  session,
  onClockedOut,
  onLogout,
}: {
  driver: DriverIdentity;
  session: DriverSessionWithInspection | null;
  onClockedOut: () => void;
  onLogout: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clockInTime = session ? new Date(session.clockInTime) : null;

  async function handleClockOut() {
    setLoading(true);
    setError(null);
    try {
      await apiRequest<DriverSession>("POST", `/api/drivers/${driver.id}/clock-out`);
      onClockedOut();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to clock out. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-8">
      <div className="flex justify-end">
        <button onClick={onLogout} className="text-sm text-muted-foreground underline underline-offset-2">
          Sign out
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-sm mx-auto w-full">
        <div className="h-16 w-16 rounded-full bg-success flex items-center justify-center text-success-foreground">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold">You're clocked in</h1>
          <p className="text-muted-foreground mt-1">
            {driver.name} &middot; Vehicle inspection passed
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Shift status
              <Badge variant="success">Clocked In</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clocked in at</span>
              <span className="font-medium">
                {clockInTime
                  ? clockInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle check</span>
              <span className="font-medium">8/8 passed</span>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button size="lg" variant="destructive" className="w-full" onClick={handleClockOut} disabled={loading}>
          {loading ? "Clocking out..." : "Clock Out"}
        </Button>
      </div>
    </div>
  );
}
