import { useCallback, useState } from "react";
import {
  ScrollArea,
  Text,
  Button,
  Separator,
  Checkbox,
  Textarea,
} from "@glaze/core/components";
import {
  Search,
  Target,
  Lightbulb,
  Rocket,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { useCanvasStore } from "../store";
import type { DiamondPhase } from "../types";

const phaseConfig: Record<
  DiamondPhase,
  { icon: typeof Search; color: string; bgColor: string; ringColor: string }
> = {
  discover: {
    icon: Search,
    color: "text-blue",
    bgColor: "bg-blue-500/10",
    ringColor: "ring-blue-500/30",
  },
  define: {
    icon: Target,
    color: "text-purple",
    bgColor: "bg-purple-500/10",
    ringColor: "ring-purple-500/30",
  },
  develop: {
    icon: Lightbulb,
    color: "text-orange",
    bgColor: "bg-orange-500/10",
    ringColor: "ring-orange-500/30",
  },
  deliver: {
    icon: Rocket,
    color: "text-green",
    bgColor: "bg-green-500/10",
    ringColor: "ring-green-500/30",
  },
};

const phaseOrder: DiamondPhase[] = ["discover", "define", "develop", "deliver"];

export function DoubleDiamond() {
  const project = useCanvasStore((s) =>
    s.projects.find((p) => p.id === s.activeProjectId),
  );
  const currentPhase = project?.methodology.currentPhase ?? "discover";
  const setPhase = useCanvasStore((s) => s.setMethodologyPhase);
  const addTask = useCanvasStore((s) => s.addMethodologyTask);
  const toggleTask = useCanvasStore((s) => s.toggleMethodologyTask);
  const removeTask = useCanvasStore((s) => s.removeMethodologyTask);
  const setNotes = useCanvasStore((s) => s.setMethodologyNotes);

  const [newTaskText, setNewTaskText] = useState("");

  const phaseData = project?.methodology.phases[currentPhase];
  const config = phaseConfig[currentPhase];
  const Icon = config.icon;

  const handleAddTask = useCallback(() => {
    if (!newTaskText.trim()) return;
    addTask(currentPhase, newTaskText.trim());
    setNewTaskText("");
  }, [newTaskText, currentPhase, addTask]);

  if (!project || !phaseData) return null;

  const currentIndex = phaseOrder.indexOf(currentPhase);

  return (
    <ScrollArea
      className="h-full"
      toolbar={
        <div className="flex items-center gap-2 px-4 h-13">
          <Text variant="strong" color="primary">
            Double Diamond
          </Text>
          <Text variant="small" color="tertiary">
            Design Research Methodology
          </Text>
        </div>
      }
    >
      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Diamond phase selector */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {phaseOrder.map((phase, index) => {
            const cfg = phaseConfig[phase];
            const PhaseIcon = cfg.icon;
            const isActive = phase === currentPhase;
            const phaseD = project.methodology.phases[phase];
            const totalTasks = phaseD.tasks.length;
            const doneTasks = phaseD.tasks.filter((t) => t.done).length;

            return (
              <div key={phase} className="flex items-center">
                <button
                  onClick={() => setPhase(phase)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? `${cfg.bgColor} ring-2 ${cfg.ringColor}`
                      : "hover:bg-list-hover"
                  }`}
                >
                  <PhaseIcon
                    className={`size-5 ${isActive ? cfg.color : "text-tertiary"}`}
                  />
                  <Text
                    variant={isActive ? "small-strong" : "small"}
                    color={isActive ? "primary" : "tertiary"}
                  >
                    {phaseD.title}
                  </Text>
                  {totalTasks > 0 ? (
                    <Text variant="mini" color="quaternary">
                      {doneTasks}/{totalTasks}
                    </Text>
                  ) : null}
                </button>
                {index < phaseOrder.length - 1 ? (
                  <div className="w-8 h-px bg-separator mx-1" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Current phase content */}
        <div className="flex flex-col gap-6">
          {/* Phase header */}
          <div className={`flex items-start gap-3 p-4 rounded-lg ${config.bgColor}`}>
            <div className={`p-2 rounded-lg ${config.bgColor} ring-1 ${config.ringColor}`}>
              <Icon className={`size-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <Text variant="heading2" color="primary">
                {phaseData.title}
              </Text>
              <Text variant="regular" color="secondary" as="p">
                {phaseData.description}
              </Text>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex flex-col gap-3">
            <Text variant="strong" color="primary">
              Tasks
            </Text>

            {/* Add task input */}
            <div className="flex items-center gap-2">
              <input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                placeholder="Add a task for this phase..."
                className="flex-1 px-3 py-1.5 rounded border border-field bg-control-subtle text-regular text-primary focus:outline-none focus:border-accent min-w-0"
              />
              <Button
                variant="filled"
                size="small"
                onClick={handleAddTask}
                disabled={!newTaskText.trim()}
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>

            {/* Task list */}
            {phaseData.tasks.length > 0 ? (
              <div className="flex flex-col gap-1">
                {phaseData.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-2 px-3 py-2 rounded hover:bg-list-hover transition-colors"
                  >
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={() => toggleTask(currentPhase, task.id)}
                    />
                    <Text
                      variant="regular"
                      color={task.done ? "tertiary" : "primary"}
                      className={task.done ? "line-through" : ""}
                    >
                      {task.text}
                    </Text>
                    <button
                      onClick={() => removeTask(currentPhase, task.id)}
                      className="ml-auto p-1 rounded text-tertiary opacity-0 group-hover:opacity-100 hover:text-red transition-all shrink-0"
                      aria-label="Remove task"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Text variant="small" color="tertiary" as="p">
                No tasks yet. Add one above to start tracking your progress.
              </Text>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Text variant="strong" color="primary">
              Notes
            </Text>
            <Textarea
              value={phaseData.notes}
              onChange={(e) => setNotes(currentPhase, e.target.value)}
              placeholder="Write your insights, findings, and observations for this phase..."
              className="min-h-32"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            {currentIndex > 0 ? (
              <Button
                variant="transparent"
                size="small"
                onClick={() => setPhase(phaseOrder[currentIndex - 1])}
              >
                ← {project.methodology.phases[phaseOrder[currentIndex - 1]].title}
              </Button>
            ) : (
              <span />
            )}
            {currentIndex < phaseOrder.length - 1 ? (
              <Button
                variant="accent"
                size="small"
                onClick={() => setPhase(phaseOrder[currentIndex + 1])}
              >
                {project.methodology.phases[phaseOrder[currentIndex + 1]].title} →
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-green">
                <Check className="size-4" />
                <Text variant="small-strong" color="green">
                  Complete
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
