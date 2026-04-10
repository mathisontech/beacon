"use client";

import { useState } from "react";
import type { TabId } from "./tab-id";
import type { ScopeId } from "./scope-id";
import { TopBar } from "./top-bar";
import { TabBar } from "./tab-bar";
import { TabBody } from "../tabs/tab-body";

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [scope] = useState<ScopeId>("home");
  const [notificationCount] = useState(0);

  return (
    <div style={S.root}>
      <TopBar
        scope={scope}
        notificationCount={notificationCount}
        onStartClick={() => {}}
        onBellClick={() => {}}
      />
      <main style={S.main}>
        <TabBody active={activeTab} />
      </main>
      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

const S = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    width: "100%",
    background: "#f8fafc",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "auto",
  },
};
