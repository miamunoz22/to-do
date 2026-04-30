import assert from "node:assert/strict";
import test from "node:test";
import { db } from "../db.js";
import { TaskRepository } from "./repository.js";

const repository = new TaskRepository();

test("task repository happy path CRUD + complete", async () => {
  await db.schema.dropTableIfExists("tasks");
  await db.schema.createTable("tasks", (table) => {
    table.uuid("id").primary();
    table.string("title").notNullable();
    table.enu("category", ["professional", "personal", "friends_family", "errands"]).notNullable();
    table.enu("priority", ["high", "medium", "low"]).notNullable();
    table.boolean("is_urgent").notNullable().defaultTo(false);
    table.datetime("due_date");
    table.integer("estimate_minutes");
    table.text("notes");
    table.enu("status", ["open", "completed"]).notNullable().defaultTo("open");
    table.datetime("created_at").notNullable().defaultTo(db.fn.now());
    table.datetime("updated_at").notNullable().defaultTo(db.fn.now());
    table.datetime("completed_at");
    table.integer("actual_minutes");
    table.integer("open_duration_minutes");
  });

  const created = await repository.create({
    title: "Test task",
    category: "professional",
    priority: "high",
    estimateMinutes: 30
  });
  assert.equal(created.status, "open");
  assert.equal(created.title, "Test task");

  const listed = await repository.list({ status: "open" });
  assert.ok(listed.length >= 1);

  const updated = await repository.update(created.id, { notes: "updated", priority: "medium" });
  assert.ok(updated);
  assert.equal(updated?.notes, "updated");
  assert.equal(updated?.priority, "medium");

  const completed = await repository.complete(created.id, 25);
  assert.ok(completed);
  assert.equal(completed?.status, "completed");
  assert.equal(completed?.actualMinutes, 25);
});
