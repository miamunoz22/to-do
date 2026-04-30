const baseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";

async function run(): Promise<void> {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Smoke task",
      category: "professional",
      priority: "high",
      estimateMinutes: 30
    })
  });
  if (!createResponse.ok) throw new Error(`Create failed: ${createResponse.status}`);
  const createdPayload = (await createResponse.json()) as { id: string };

  const focusResponse = await fetch(`${baseUrl}/focus/today`);
  if (!focusResponse.ok) throw new Error(`Focus failed: ${focusResponse.status}`);

  const completeResponse = await fetch(`${baseUrl}/tasks/${createdPayload.id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actualMinutes: 22 })
  });
  if (!completeResponse.ok) throw new Error(`Complete failed: ${completeResponse.status}`);

  const insightsResponse = await fetch(`${baseUrl}/insights/weekly`);
  if (!insightsResponse.ok) throw new Error(`Insights failed: ${insightsResponse.status}`);

  console.log("Smoke check passed: create -> focus -> complete -> insights");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
