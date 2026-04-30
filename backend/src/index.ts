import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { verifyDatabaseConnection } from "./db.js";
import { rankTasks } from "./tasks/prioritization.js";
import { taskRepository } from "./tasks/repository.js";
import {
  asOptionalBoolean,
  asOptionalNullableString,
  asOptionalNumber,
  asOptionalString,
  isRecord,
  parseCategory,
  parsePriority,
  parseStatus
} from "./tasks/validators.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const appName = process.env.APP_NAME ?? "smart-todo-backend";

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: appName,
    timestamp: new Date().toISOString()
  });
});

app.post("/tasks", async (req, res) => {
  try {
    if (!isRecord(req.body)) throw new Error("Request body must be an object");
    const title = asOptionalString(req.body.title) ?? "";
    if (!title.trim()) throw new Error("title is required");
    const created = await taskRepository.create({
      title,
      category: parseCategory(req.body.category),
      priority: parsePriority(req.body.priority),
      isUrgent: asOptionalBoolean(req.body.isUrgent),
      dueDate: asOptionalNullableString(req.body.dueDate),
      estimateMinutes: asOptionalNumber(req.body.estimateMinutes),
      notes: asOptionalNullableString(req.body.notes)
    });
    res.status(201).json({ id: created.id, task: created });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid payload" });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const status =
      typeof req.query.status === "string" ? parseStatus(req.query.status) : undefined;
    const category =
      typeof req.query.category === "string" ? parseCategory(req.query.category) : undefined;
    const priority =
      typeof req.query.priority === "string" ? parsePriority(req.query.priority) : undefined;
    const tasks = await taskRepository.list({ status, category, priority });
    res.json({ tasks });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid query" });
  }
});

app.patch("/tasks/:id", async (req, res) => {
  try {
    if (!isRecord(req.body)) throw new Error("Request body must be an object");
    const updated = await taskRepository.update(req.params.id, {
      title: asOptionalString(req.body.title),
      category:
        req.body.category !== undefined ? parseCategory(req.body.category) : undefined,
      priority:
        req.body.priority !== undefined ? parsePriority(req.body.priority) : undefined,
      isUrgent: asOptionalBoolean(req.body.isUrgent),
      dueDate: asOptionalNullableString(req.body.dueDate),
      estimateMinutes: asOptionalNumber(req.body.estimateMinutes),
      notes: asOptionalNullableString(req.body.notes),
      status: req.body.status !== undefined ? parseStatus(req.body.status) : undefined
    });
    if (!updated) return res.status(404).json({ error: "Task not found" });
    return res.json({ task: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid payload" });
  }
});

app.post("/tasks/:id/complete", async (req, res) => {
  try {
    if (!isRecord(req.body)) throw new Error("Request body must be an object");
    const actualMinutes = asOptionalNumber(req.body.actualMinutes);
    if (actualMinutes === undefined || actualMinutes < 0) {
      throw new Error("actualMinutes must be a non-negative number");
    }
    const completed = await taskRepository.complete(req.params.id, actualMinutes);
    if (!completed) return res.status(404).json({ error: "Task not found" });
    return res.json({ task: completed });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid payload" });
  }
});

app.get("/focus/today", async (_req, res) => {
  const tasks = await taskRepository.list({ status: "open" });
  const ranked = rankTasks(tasks).slice(0, 5);
  res.json({
    tasks: ranked.map((item) => ({
      ...item.task,
      score: item.score,
      scoreReason: item.scoreReason
    }))
  });
});

app.get("/insights/weekly", async (_req, res) => {
  const tasks = await taskRepository.list();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const completedThisWeek = tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt).getTime() >= weekAgo
  );
  const byPriority = completedThisWeek.reduce<Record<string, number>>((acc, task) => {
    acc[task.priority] = (acc[task.priority] ?? 0) + 1;
    return acc;
  }, {});
  const byCategory = completedThisWeek.reduce<Record<string, number>>((acc, task) => {
    acc[task.category] = (acc[task.category] ?? 0) + 1;
    return acc;
  }, {});
  const estimated = completedThisWeek
    .map((t) => t.estimateMinutes ?? 0)
    .reduce((a, b) => a + b, 0);
  const actual = completedThisWeek
    .map((t) => t.actualMinutes ?? 0)
    .reduce((a, b) => a + b, 0);
  const completionRate = tasks.length ? completedThisWeek.length / tasks.length : 0;
  res.json({
    completionRate,
    completedCount: completedThisWeek.length,
    byPriority,
    byCategory,
    estimateVsActualMinutes: {
      estimated,
      actual
    }
  });
});

async function bootstrap(): Promise<void> {
  await verifyDatabaseConnection();

  app.listen(port, () => {
    console.log(`[${appName}] listening on port ${port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error(`[${appName}] failed to start`, error);
  process.exit(1);
});
