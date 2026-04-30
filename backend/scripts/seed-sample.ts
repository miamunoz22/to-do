import dotenv from "dotenv";
import { db } from "../src/db.js";
import { taskRepository } from "../src/tasks/repository.js";

dotenv.config();

async function run(): Promise<void> {
  const samples = [
    {
      title: "Prepare project brief",
      category: "professional" as const,
      priority: "high" as const,
      estimateMinutes: 90
    },
    {
      title: "Pick up groceries",
      category: "errands" as const,
      priority: "medium" as const,
      estimateMinutes: 45
    },
    {
      title: "Call family",
      category: "friends_family" as const,
      priority: "low" as const,
      estimateMinutes: 20
    }
  ];
  for (const sample of samples) {
    await taskRepository.create(sample);
  }
  console.log(`Seeded ${samples.length} sample tasks`);
  await db.destroy();
}

run().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});
