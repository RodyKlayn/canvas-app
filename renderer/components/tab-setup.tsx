import { useState } from "react";
import { Button, Text } from "@glaze/core/components";
import { LayoutGrid, FileText, Compass, Box, History, Ruler, Search, Layers, Check } from "lucide-react";
import { useCanvasStore } from "../store";
import { AVAILABLE_TABS } from "../types";
import type { TabId } from "../types";

const iconMap: Record<string, React.ReactNode> = {
  "layout-grid": <LayoutGrid className="size-5" />,
  "file-text": <FileText className="size-5" />,
  compass: <Compass className="size-5" />,
  box: <Box className="size-5" />,
  history: <History className="size-5" />,
  ruler: <Ruler className="size-5" />,
  search: <Search className="size-5" />,
  layers: <Layers className="size-5" />,
};

export function TabSetup({ onComplete }: { onComplete?: () => void }) {
  const storeTabs = useCanvasStore((s) => s.tabs);
  const setTabs = useCanvasStore((s) => s.setTabs);
  const completeSetup = useCanvasStore((s) => s.completeSetup);
  const [selected, setSelected] = useState<Set<TabId>>(
    () => new Set(storeTabs.filter((t) => t.enabled).map((t) => t.id))
  );

  const toggle = (id: TabId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    const newTabs = AVAILABLE_TABS.map((t) => ({ ...t, enabled: selected.has(t.id) }));
    // Ensure at least one tab is enabled
    if (selected.size === 0) {
      newTabs[0].enabled = true;
      selected.add(newTabs[0].id);
    }
    setTabs(newTabs);
    completeSetup();
    onComplete?.();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-app">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Canvas</h1>
          <Text color="tertiary" className="mt-2 block">
            Choose the tabs you want to start with. You can change, add or delete them anytime in Configuration.
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {AVAILABLE_TABS.map((tab) => {
            const isSelected = selected.has(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => toggle(tab.id)}
                className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "bg-accent/10 border-accent shadow-sm"
                    : "bg-popover border-separator hover:border-secondary hover:bg-list-hover"
                }`}
              >
                <div
                  className={`size-10 rounded-lg grid place-items-center shrink-0 ${
                    isSelected ? "bg-accent text-white" : "bg-control text-tertiary"
                  }`}
                >
                  {iconMap[tab.icon] ?? <Box className="size-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Text variant="strong" className="block">
                    {tab.label}
                  </Text>
                  <Text variant="small" color="tertiary" className="block leading-tight mt-0.5">
                    {tab.description}
                  </Text>
                </div>
                {isSelected && (
                  <div className="size-5 rounded-full bg-accent text-white grid place-items-center shrink-0">
                    <Check className="size-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <Text variant="mini" color="quaternary">
            {selected.size} of {AVAILABLE_TABS.length} selected • You can reconfigure later
          </Text>
          <Button variant="accent" onClick={handleContinue}>
            Continue with {selected.size} tabs
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TabConfigurator() {
  const tabs = useCanvasStore((s) => s.tabs);
  const setTabs = useCanvasStore((s) => s.setTabs);
  const toggleTab = useCanvasStore((s) => s.toggleTab);
  const resetTabs = useCanvasStore((s) => s.resetTabs);

  const move = (id: TabId, dir: -1 | 1) => {
    const idx = tabs.findIndex((t) => t.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= tabs.length) return;
    const newTabs = [...tabs];
    const [moved] = newTabs.splice(idx, 1);
    newTabs.splice(newIdx, 0, moved);
    setTabs(newTabs.map((t, i) => ({ ...t, order: i })));
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <Text variant="strong">Configure Tabs</Text>
        <Text variant="small" color="tertiary" className="block">
          Enable, disable, or reorder tabs. Changes apply instantly.
        </Text>
      </div>

      <div className="space-y-2">
        {tabs
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                tab.enabled ? "bg-popover border-separator" : "bg-control/50 border-separator opacity-60"
              }`}
            >
              <div className="size-8 rounded-md bg-control grid place-items-center shrink-0">
                {iconMap[tab.icon] ?? <Box className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <Text variant="small" className="font-medium">
                  {tab.label}
                </Text>
                <Text variant="mini" color="tertiary" truncate>
                  {tab.description}
                </Text>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="glass"
                  size="small"
                  iconOnly
                  onClick={() => move(tab.id, -1)}
                  aria-label="Move up"
                  title="Move up"
                >
                  ↑
                </Button>
                <Button
                  variant="glass"
                  size="small"
                  iconOnly
                  onClick={() => move(tab.id, 1)}
                  aria-label="Move down"
                  title="Move down"
                >
                  ↓
                </Button>
                <Button
                  variant={tab.enabled ? "accent" : "glass"}
                  size="small"
                  onClick={() => toggleTab(tab.id, !tab.enabled)}
                  title={tab.enabled ? "Disable tab" : "Enable tab"}
                >
                  {tab.enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
          ))}
      </div>

      <div className="flex gap-2">
        <Button variant="glass" size="small" onClick={() => resetTabs()}>
          Reset to defaults
        </Button>
        <Text variant="mini" color="quaternary" className="self-center">
          Tip: Use the sidebar toggle to hide tabs you don't need
        </Text>
      </div>
    </div>
  );
}
