import { Button } from "@/components/ui/button";
import type { DriverIdentity } from "@/hooks/use-driver";

export default function GetStarted({
  driver,
  onLogout,
  onBeginShift,
}: {
  driver: DriverIdentity;
  onLogout: () => void;
  onBeginShift: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-8">
      <div className="flex justify-end">
        <button onClick={onLogout} className="text-sm text-muted-foreground underline underline-offset-2">
          Sign out
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 max-w-sm mx-auto">
        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
          {driver.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{greeting}, {driver.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground mt-2">
            Before you clock in, you'll complete a quick vehicle safety check. It only takes a minute.
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={onBeginShift}>
          Begin Shift
        </Button>
      </div>
    </div>
  );
}
