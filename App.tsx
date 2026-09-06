import { useEffect } from "react";
import { useForge } from "@/lib/store";
import { PhoneChrome } from "./PhoneChrome";
import { HomeView } from "./views/HomeView";
import { LibraryView } from "./views/LibraryView";
import { BoostView } from "./views/BoostView";
import { TriggerStudio } from "./views/TriggerStudio";
import { PluginLab } from "./views/PluginLab";
import { NetworkView } from "./views/NetworkView";
import { PubgProfile } from "./views/PubgProfile";
import { SettingsView } from "./views/SettingsView";
import { BattleSession } from "./session/BattleSession";

export function App() {
  const view = useForge((s) => s.view);
  const tick = useForge((s) => s.tickTelemetry);

  useEffect(() => {
    void useForge.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (view === "session") return;
    const tel = window.setInterval(() => tick(false, 0), 500);
    return () => window.clearInterval(tel);
  }, [tick, view]);

  if (view === "session") {
    return (
      <PhoneChrome>
        <BattleSession />
      </PhoneChrome>
    );
  }

  return (
    <PhoneChrome>
      {view === "home" && <HomeView />}
      {view === "library" && <LibraryView />}
      {view === "boost" && <BoostView />}
      {view === "triggers" && <TriggerStudio />}
      {view === "plugins" && <PluginLab />}
      {view === "network" && <NetworkView />}
      {view === "pubg" && <PubgProfile />}
      {view === "settings" && <SettingsView />}
    </PhoneChrome>
  );
}
