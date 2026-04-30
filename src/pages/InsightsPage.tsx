import { useEffect, useState } from "react";
import { fetchInsights } from "../api";

function InsightsPage(): JSX.Element {
  const [data, setData] = useState<{
    completionRate: number;
    completedCount: number;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    estimateVsActualMinutes: { estimated: number; actual: number };
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const result = await fetchInsights();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load insights");
      }
    })();
  }, []);

  return (
    <section className="panel">
      <h2>Insights</h2>
      <p className="muted">Weekly completion and effort metrics from backend.</p>
      {error ? <p className="error">{error}</p> : null}
      <div className="insight-grid">
        <article className="insight-card">
          <h3>Completed Today</h3>
          <p>{data?.completedCount ?? 0} tasks</p>
        </article>
        <article className="insight-card">
          <h3>Focus List Completion</h3>
          <p>{Math.round((data?.completionRate ?? 0) * 100)}%</p>
        </article>
        <article className="insight-card">
          <h3>Estimate vs Actual</h3>
          <p>
            {data?.estimateVsActualMinutes.estimated ?? 0}m est /{" "}
            {data?.estimateVsActualMinutes.actual ?? 0}m actual
          </p>
        </article>
        <article className="insight-card">
          <h3>By Priority</h3>
          <p>{JSON.stringify(data?.byPriority ?? {})}</p>
        </article>
      </div>
    </section>
  );
}

export default InsightsPage;
