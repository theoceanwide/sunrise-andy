import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/queryClient";
import { INSPECTION_ITEMS, type InspectionChecklistItem } from "@shared/schema";
import type { DriverIdentity } from "@/hooks/use-driver";
import type { DriverSessionWithInspection } from "@shared/schema";

type ChecklistState = Record<string, boolean>;

export default function VehicleInspection({
  driver,
  onBack,
  onClockedIn,
}: {
  driver: DriverIdentity;
  onBack: () => void;
  onClockedIn: (session: DriverSessionWithInspection) => void;
}) {
  const [checked, setChecked] = useState<ChecklistState>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = INSPECTION_ITEMS.every((item) => checked[item.key]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const checklist: InspectionChecklistItem[] = INSPECTION_ITEMS.map((item) => ({
      key: item.key,
      label: item.label,
      passed: !!checked[item.key],
    }));

    try {
      const session = await apiRequest<DriverSessionWithInspection>(
        "POST",
        `/api/drivers/${driver.id}/clock-in`,
        { checklist },
      );
      onClockedIn(session);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong submitting your inspection. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Daily Vehicle Inspection</CardTitle>
            <CardDescription>
              Confirm each item is in safe working order before you clock in. This check is required every shift.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {INSPECTION_ITEMS.map((item) => {
              const isChecked = !!checked[item.key];
              return (
                <label
                  key={item.key}
                  htmlFor={item.key}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-3 cursor-pointer hover:bg-accent"
                >
                  <span className="text-base">{item.label}</span>
                  <Checkbox
                    id={item.key}
                    checked={isChecked}
                    onCheckedChange={(value) =>
                      setChecked((prev) => ({ ...prev, [item.key]: value === true }))
                    }
                  />
                </label>
              );
            })}

            {error && (
              <p className="text-sm text-destructive pt-2" role="alert">
                {error}
              </p>
            )}

            <Button
              size="lg"
              className="w-full mt-4"
              disabled={!allChecked || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Complete Check-In & Clock In"}
            </Button>
            {!allChecked && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                All items must be confirmed to clock in.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
