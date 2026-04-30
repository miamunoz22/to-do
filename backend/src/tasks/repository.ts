import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import { CreateTaskInput, Task, UpdateTaskInput } from "./types.js";

type TaskRow = {
  id: string;
  title: string;
  category: Task["category"];
  priority: Task["priority"];
  is_urgent: number;
  due_date: string | null;
  estimate_minutes: number | null;
  notes: string | null;
  status: Task["status"];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  actual_minutes: number | null;
  open_duration_minutes: number | null;
};

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    isUrgent: row.is_urgent === 1,
    dueDate: row.due_date,
    estimateMinutes: row.estimate_minutes,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    actualMinutes: row.actual_minutes,
    openDurationMinutes: row.open_duration_minutes
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

export class TaskRepository {
  async create(input: CreateTaskInput): Promise<Task> {
    const now = nowIso();
    const id = randomUUID();
    await db("tasks").insert({
      id,
      title: input.title.trim(),
      category: input.category,
      priority: input.priority,
      is_urgent: input.isUrgent ? 1 : 0,
      due_date: input.dueDate ?? null,
      estimate_minutes: input.estimateMinutes ?? null,
      notes: input.notes ?? null,
      status: "open",
      created_at: now,
      updated_at: now
    });
    const row = (await db("tasks").where({ id }).first()) as TaskRow;
    return toTask(row);
  }

  async getById(id: string): Promise<Task | null> {
    const row = (await db("tasks").where({ id }).first()) as TaskRow | undefined;
    return row ? toTask(row) : null;
  }

  async list(filters?: {
    status?: Task["status"];
    category?: Task["category"];
    priority?: Task["priority"];
  }): Promise<Task[]> {
    const query = db("tasks").select("*");
    if (filters?.status) query.where("status", filters.status);
    if (filters?.category) query.where("category", filters.category);
    if (filters?.priority) query.where("priority", filters.priority);
    query.orderBy("created_at", "asc");
    const rows = (await query) as TaskRow[];
    return rows.map(toTask);
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.category !== undefined) patch.category = input.category;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.isUrgent !== undefined) patch.is_urgent = input.isUrgent ? 1 : 0;
    if (input.dueDate !== undefined) patch.due_date = input.dueDate;
    if (input.estimateMinutes !== undefined) patch.estimate_minutes = input.estimateMinutes;
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.status !== undefined) patch.status = input.status;
    const updated = await db("tasks").where({ id }).update(patch);
    if (!updated) return null;
    const row = (await db("tasks").where({ id }).first()) as TaskRow;
    return toTask(row);
  }

  async complete(id: string, actualMinutes: number): Promise<Task | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const completedAt = nowIso();
    const openDurationMinutes = Math.max(
      0,
      Math.round((new Date(completedAt).getTime() - new Date(existing.createdAt).getTime()) / 60000)
    );
    await db("tasks")
      .where({ id })
      .update({
        status: "completed",
        actual_minutes: actualMinutes,
        completed_at: completedAt,
        open_duration_minutes: openDurationMinutes,
        updated_at: completedAt
      });
    const row = (await db("tasks").where({ id }).first()) as TaskRow;
    return toTask(row);
  }
}

export const taskRepository = new TaskRepository();
