import { FormEvent, useEffect, useState } from "react";
import { Category, Priority, Task, completeTask, createTask, listTasks, updateTask } from "../api";

const categoryOptions: Category[] = ["professional", "personal", "friends_family", "errands"];
const priorityOptions: Priority[] = ["high", "medium", "low"];

function TaskListPage(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("professional");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const response = await listTasks("open");
      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  async function onCreateTask(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!title.trim()) return;
    setError("");
    try {
      await createTask({
        title: title.trim(),
        category,
        priority,
        dueDate: dueDate || null
      });
      setTitle("");
      setDueDate("");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  }

  async function bumpPriority(task: Task): Promise<void> {
    const index = priorityOptions.indexOf(task.priority);
    const next = priorityOptions[Math.max(0, index - 1)];
    if (next === task.priority) return;
    await updateTask(task.id, { priority: next });
    await loadTasks();
  }

  async function markComplete(task: Task): Promise<void> {
    const input = window.prompt("How many minutes did this task take?", "30");
    if (!input) return;
    const actualMinutes = Number(input);
    if (Number.isNaN(actualMinutes) || actualMinutes < 0) {
      setError("Please enter a valid non-negative number.");
      return;
    }
    await completeTask(task.id, actualMinutes);
    await loadTasks();
  }

  return (
    <section className="panel">
      <h2>Task List</h2>
      <p className="muted">Create and manage open tasks. Bump priority or mark complete.</p>
      <form className="task-form" onSubmit={(event) => void onCreateTask(event)}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task title"
          required
        />
        <div className="form-row">
          <select value={category} onChange={(event) => setCategory(event.target.value as Category)}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
        <button type="submit">Add Task</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Loading tasks...</p> : null}
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-card">
            <strong>{task.title}</strong>
            <span>{task.category}</span>
            <span>{task.priority} priority</span>
            <div className="button-row">
              <button type="button" onClick={() => void bumpPriority(task)}>
                Bump Priority
              </button>
              <button type="button" onClick={() => void markComplete(task)}>
                Complete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TaskListPage;
