import { useCallback, useEffect, useState } from "react";

export interface DriverIdentity {
  id: number;
  username: string;
  name: string;
  role: "admin" | "driver";
}

const STORAGE_KEY = "sunrise.driver";

export function useDriver() {
  const [driver, setDriverState] = useState<DriverIdentity | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DriverIdentity) : null;
  });

  useEffect(() => {
    if (driver) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(driver));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [driver]);

  const setDriver = useCallback((d: DriverIdentity | null) => setDriverState(d), []);
  const logout = useCallback(() => setDriverState(null), []);

  return { driver, setDriver, logout };
}
