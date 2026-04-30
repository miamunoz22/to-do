import dotenv from "dotenv";
import knex from "knex";
import path from "path";

dotenv.config();

const dbFile = process.env.DATABASE_FILE ?? "./data/dev.sqlite3";

export const db = knex({
  client: "sqlite3",
  connection: {
    filename: path.resolve(process.cwd(), dbFile)
  },
  useNullAsDefault: true
});

export async function verifyDatabaseConnection(): Promise<void> {
  await db.raw("select 1 as connection_ok");
}
