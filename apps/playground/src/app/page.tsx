"use client";

import { PlaygroundClient } from "@/components/playground-client";

export default function Page() {
  return (
    <main className="relative h-dvh overflow-hidden bg-background p-2 transition-colors duration-300 md:p-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(99,102,241,0.12),transparent_36%),radial-gradient(circle_at_90%_6%,rgba(56,189,248,0.08),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_35%)]" />
      <div className="relative z-10 h-full min-h-0">
        <PlaygroundClient />
      </div>
    </main>
  );
}
