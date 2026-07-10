import { useDriver } from "@/hooks/use-driver";
import LoginPage from "@/pages/Login";
import DriverApp from "@/pages/DriverApp";

export default function App() {
  const { driver, setDriver, logout } = useDriver();

  if (!driver) {
    return <LoginPage onLogin={setDriver} />;
  }

  return <DriverApp driver={driver} onLogout={logout} />;
}
