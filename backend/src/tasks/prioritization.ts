import { Task } from "./types.js";

const priorityWeight: Record<Task["priority"], number> = {
  high: 50,
  medium: 30,
  low: 10
};

function minutesUntil(dateIso: string): number {
  return (new Date(dateIso).getTime() - Date.now()) / 60000;
}

function dueDateScore(task: Task): number {
  if (!task.dueDate) return 0;
  const mins = minutesUntil(task.dueDate);
  if (mins <= 0) return 40;
  if (mins <= 24 * 60) return 25;
  if (mins <= 3 * 24 * 60) return 15;
  return 5;
}

function stalenessScore(task: Task): number {
  const ageMins = (Date.now() - new Date(task.createdAt).getTime()) / 60000;
  const ageDays = ageMins / (60 * 24);
  return Math.min(20, Math.floor(ageDays * 2));
}

export interface RankedTask {
  task: Task;
  score: number;
  scoreReason: string;
}

export function rankTasks(tasks: Task[]): RankedTask[] {
  const open = tasks.filter((t) => t.status === "open");
  const categoryCounts = open.reduce<Record<string, number>>((acc, task) => {
    acc[task.category] = (acc[task.category] ?? 0) + 1;
    return acc;
  }, {});

  const ranked = open.map((task) => {
    const p = priorityWeight[task.priority];
    const urgent = task.isUrgent ? 15 : 0;
    const due = dueDateScore(task);
    const stale = stalenessScore(task);
    const categoryLoad = categoryCounts[task.category] ?? 1;
    const categoryBalancePenalty = categoryLoad > 3 ? 5 : 0;
    const score = p + urgent + due + stale - categoryBalancePenalty;
    const reason = [
      `${task.priority} priority (+${p})`,
      task.isUrgent ? "urgent (+15)" : "not urgent (+0)",
      `due pressure (+${due})`,
      `staleness (+${stale})`,
      categoryBalancePenalty ? `category balancing (-${categoryBalancePenalty})` : null
    ]
      .filter(Boolean)
      .join(", ");
    return { task, score, scoreReason: reason };
  });

  return ranked.sort((a, b) => b.score - a.score);
}
