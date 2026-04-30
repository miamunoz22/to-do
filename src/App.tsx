import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import InsightsPage from "./pages/InsightsPage";
import TaskListPage from "./pages/TaskListPage";

function App(): JSX.Element {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1>Smart To-Do MVP</h1>
        <p>Focus on the right tasks today.</p>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Primary">
        <NavLink
          to="/tasks"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Task List
        </NavLink>
        <NavLink
          to="/insights"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Insights
        </NavLink>
      </nav>
    </div>
  );
}

export default App;
