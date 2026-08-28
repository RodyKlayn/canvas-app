import { useState } from "react";
import { Button, Text } from "@glaze/core/components";
import { Film, Download, Save, Plus } from "lucide-react";
import { useCanvasStore } from "../store";

export function ScreenplayEditor() {
  const project = useCanvasStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const [text, setText] = useState<string>(
    project?.documents?.[0]?.content ? String(project.documents[0].content) : 
    "INT. COFFEE SHOP - DAY\n\nALEX (30s) sits by the window, typing furiously on a sleek laptop.\n\nBARISTA\n(O.S.)\nYour double espresso, Alex.\n\nALEX\nThanks. Just in time.\n\nAlex takes a sip, staring at the glowing screen."
  );

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (project?.name || "Screenplay") + ".fountain";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Fountain auto-formatting engine on render
  const renderFountainLines = () => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-4" />;
      
      // Scene Heading: starts with INT., EXT., INT/EXT., EST., or all caps with specific cues
      if (/^(INT|EXT|EST|INT\/EXT)\b/i.test(trimmed) || /^[A-Z0-9\s\-\.\,\/\(\)]+$/.test(trimmed) && trimmed === trimmed.toUpperCase() && !trimmed.endsWith(":") && trimmed.length < 60) {
        return (
          <div key={idx} className="font-bold text-primary uppercase tracking-wide my-4 text-sm font-mono">
            {trimmed}
          </div>
        );
      }
      
      // Parenthetical: starts and ends with parentheses
      if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
        return (
          <div key={idx} className="text-secondary italic text-center text-xs my-0.5 font-mono pl-12">
            {trimmed}
          </div>
        );
      }
      
      // Character: all caps, short, not ending in punctuation
      if (trimmed === trimmed.toUpperCase() && trimmed.length < 35 && !/[.?!]$/.test(trimmed)) {
        return (
          <div key={idx} className="font-bold text-accent uppercase text-xs mt-4 mb-0.5 font-mono text-center tracking-wider">
            {trimmed}
          </div>
        );
      }
      
      // Dialogue
      const prevLine = idx > 0 ? lines[idx - 1].trim() : "";
      const isLikelyDialogue = prevLine === prevLine.toUpperCase() && prevLine.length < 35 && prevLine.length > 0;
      if (isLikelyDialogue || trimmed.startsWith("O.S.") || trimmed.startsWith("V.O.")) {
        return (
          <div key={idx} className="text-primary text-xs font-mono max-w-[420px] mx-auto text-left mb-2 leading-relaxed">
            {trimmed}
          </div>
        );
      }

      // Action / Description
      return (
        <div key={idx} className="text-primary text-xs font-mono mb-3 leading-relaxed">
          {trimmed}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-app">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-separator bg-popover">
        <div className="flex items-center gap-2">
          <Film className="size-4 text-accent" />
          <Text variant="small" className="font-semibold">
            Screenplay Studio ({project?.name || "Untitled"})
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="glass" size="small" aria-label="Download Fountain Script" title="Download Fountain Script" onClick={handleDownload}>
            <Download className="size-3.5" />
            Export .Fountain
          </Button>
        </div>
      </div>

      {/* Split Editor & Preview */}
      <div className="flex-1 flex min-h-0">
        {/* Raw Editor */}
        <div className="w-1/2 flex flex-col border-r border-separator bg-well p-4">
          <div className="flex items-center justify-between mb-2">
            <Text variant="mini" color="tertiary" className="uppercase tracking-wide font-medium">
              Fountain Raw Text
            </Text>
            <Text variant="mini" color="quaternary">
              Auto-formats instantly
            </Text>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your screenplay in standard Fountain format... (INT. ROOM - DAY)"
            className="flex-1 w-full bg-popover text-primary border border-separator rounded-lg p-4 font-mono text-xs leading-relaxed resize-none outline-none focus:ring-1 focus:ring-accent"
            spellCheck={false}
          />
        </div>

        {/* Formatted Screenplay Preview */}
        <div className="w-1/2 flex flex-col bg-app p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Text variant="mini" color="tertiary" className="uppercase tracking-wide font-medium">
              Standard Screenplay Formatter
            </Text>
            <Text variant="mini" color="quaternary">
              Industry Standard Layout
            </Text>
          </div>
          <div className="max-w-[540px] w-full mx-auto bg-popover border border-separator rounded-xl p-8 shadow-sm min-h-[500px]">
            {renderFountainLines()}
          </div>
        </div>
      </div>
    </div>
  );
}
