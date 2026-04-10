"use client";

import { useEffect, useState } from "react";

type SalesModeLayoutProps = {
  organizationId: string;
  organizationName: string;
  stats: React.ReactNode;
  adminPanels: React.ReactNode;
  inventoryPanel: React.ReactNode;
};

const getStorageKey = (organizationId: string) => `sales-mode:${organizationId}`;

export function SalesModeLayout({
  organizationId,
  organizationName,
  stats,
  adminPanels,
  inventoryPanel
}: SalesModeLayoutProps) {
  const [salesMode, setSalesMode] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(getStorageKey(organizationId));
    setSalesMode(storedValue === "true");
  }, [organizationId]);

  function handleToggle() {
    setSalesMode((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(getStorageKey(organizationId), String(nextValue));
      return nextValue;
    });
  }

  return (
    <section className="page-grid">
      <div className="hero">
        <div className="mode-header">
          <div className="stack" style={{ gap: "8px" }}>
            <span className="eyebrow">Event</span>
            <h1>{organizationName}</h1>
            <p>
              {salesMode
                ? "Sales mode is on. Inventory stays visible while setup and collaborator controls stay out of the way."
                : "Manage collaborators, add inventory, and keep sales moving without losing track of stock for this event."}
            </p>
          </div>

          <button
            aria-pressed={salesMode}
            className={`mode-toggle ${salesMode ? "active" : ""}`}
            onClick={handleToggle}
            type="button"
          >
            <span>{salesMode ? "Sales Mode On" : "Sales Mode Off"}</span>
            <span className="mode-toggle-track">
              <span className="mode-toggle-knob" />
            </span>
          </button>
        </div>
      </div>

      {stats}
      {salesMode ? <div className="sales-mode-banner">Selling view enabled. Admin panels are hidden.</div> : null}
      {!salesMode ? adminPanels : null}
      {inventoryPanel}
    </section>
  );
}
