import { categories, priorities, taskStatuses } from "./types.js";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function asOptionalString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error("Expected string");
  return value;
}

export function asOptionalNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("Expected nullable string");
  return value;
}

export function asOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw new Error("Expected boolean");
  return value;
}

export function asOptionalNumber(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) throw new Error("Expected number");
  return value;
}

export function parseCategory(value: unknown): (typeof categories)[number] {
  if (typeof value !== "string" || !categories.includes(value as (typeof categories)[number])) {
    throw new Error(`category must be one of: ${categories.join(", ")}`);
  }
  return value as (typeof categories)[number];
}

export function parsePriority(value: unknown): (typeof priorities)[number] {
  if (typeof value !== "string" || !priorities.includes(value as (typeof priorities)[number])) {
    throw new Error(`priority must be one of: ${priorities.join(", ")}`);
  }
  return value as (typeof priorities)[number];
}

export function parseStatus(value: unknown): (typeof taskStatuses)[number] {
  if (
    typeof value !== "string" ||
    !taskStatuses.includes(value as (typeof taskStatuses)[number])
  ) {
    throw new Error(`status must be one of: ${taskStatuses.join(", ")}`);
  }
  return value as (typeof taskStatuses)[number];
}
