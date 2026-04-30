export const categories = [
  "professional",
  "personal",
  "friends_family",
  "errands"
] as const;
export const priorities = ["high", "medium", "low"] as const;
export const taskStatuses = ["open", "completed"] as const;

export type Category = (typeof categories)[number];
export type Priority = (typeof priorities)[number];
export type TaskStatus = (typeof taskStatuses)[number];

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
}

export interface CreateTaskInput {
  title: string;
  category: Category;
  priority: Priority;
  isUrgent?: boolean;
  dueDate?: string | null;
  estimateMinutes?: number | null;
  notes?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  category?: Category;
  priority?: Priority;
  isUrgent?: boolean;
  dueDate?: string | null;
  estimateMinutes?: number | null;
  notes?: string | null;
  status?: TaskStatus;
}
