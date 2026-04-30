export type Category = "professional" | "personal" | "friends_family" | "errands";
export type Priority = "high" | "medium" | "low";
export type TaskStatus = "open" | "completed";

export interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  isUrgent: boolean;
  dueDate: string | null;
  estimateMinutes: number | null;
  notes: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  actualMinutes: number | null;
  openDurationMinutes: number | null;
  score?: number;
  scoreReason?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export function listTasks(status: TaskStatus = "open"): Promise<{ tasks: Task[] }> {
  return request(`/tasks?status=${status}`);
}

export function createTask(payload: {
  title: string;
  category: Category;
  priority: Priority;
  dueDate?: string | null;
  estimateMinutes?: number | null;
  notes?: string | null;
}): Promise<{ id: string; task: Task }> {
  return request("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function updateTask(
  id: string,
  payload: Partial<{ priority: Priority; title: string; category: Category; notes: string }>
): Promise<{ task: Task }> {
  return request(`/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function completeTask(id: string, actualMinutes: number): Promise<{ task: Task }> {
  return request(`/tasks/${id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actualMinutes })
  });
}

export function fetchInsights(): Promise<{
  completionRate: number;
  completedCount: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  estimateVsActualMinutes: { estimated: number; actual: number };
}> {
  return request("/insights/weekly");
}
