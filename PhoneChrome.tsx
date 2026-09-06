import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useForge } from "@/lib/store";

export function PhoneChrome({ children }: { children: ReactNode }) {
  const armed = useForge((s) => s.armed);
  const setArmed = useForge((s) => s.setArmed);
  const view = useForge((s) => s.view);
  const [time, setTime] = useState("12:00");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="scan-grid flex min-h-dvh items-center justify-center bg-background p-0 sm:p-6">
      <div
        className={cn(
          "relative flex h-dvh w-full flex-col overflow-hidden bg-panel sm:h-[min(860px,calc(100dvh-48px))] sm:w-[min(400px,calc(100vw-48px))] sm:rounded-[2rem] sm:phone-frame",
        )}
      >
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-40 hidden h-7 sm:block">
          <div className="mx-auto mt-2 h-4 w-24 rounded-full bg-void" />
        </div>
        <button
          type="button"
          aria-label={armed ? "Disarm Game Key" : "Arm Game Key"}
          onClick={() => setArmed(!armed)}
          className={cn(
            "absolute top-28 right-0 z-40 hidden h-14 w-2 rounded-l-sm sm:block",
            armed ? "bg-primary" : "bg-muted-foreground/40",
          )}
        />
        <div className="flex items-center justify-between px-5 pt-3 pb-1 font-mono text-[10px] text-muted-foreground sm:pt-8">
          <span>Note 10+</span>
          <span className="tabular">{time}</span>
          <span>{armed ? "GAME" : "IDLE"}</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        {view !== "session" && <TabBar />}
      </div>
    </div>
  );
}

function TabBar() {
  const view = useForge((s) => s.view);
  const setView = useForge((s) => s.setView);
  const tabs = [
    { id: "home" as const, label: "Space" },
    { id: "pubg" as const, label: "PUBG" },
    { id: "triggers" as const, label: "Triggers" },
    { id: "plugins" as const, label: "Plugins" },
    { id: "boost" as const, label: "Cube" },
  ];
  return (
    <nav className="grid grid-cols-5 border-t border-border bg-card/90 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setView(t.id)}
          className={cn(
            "flex h-11 flex-col items-center justify-center rounded-md font-mono text-[10px] tracking-wide uppercase",
            view === t.id ? "text-primary" : "text-muted-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
