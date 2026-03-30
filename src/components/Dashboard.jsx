import { useEffect, useState } from "react";
import BASE_URL from "../api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState({});
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const dashRes = await BASE_URL.get("dashboard/");
      const taskRes = await BASE_URL.get("tasks/");
      const projRes = await BASE_URL.get("projects/");

      setDashboard(dashRes.data);
      setTasks(taskRes.data);
      setProjects(projRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ DRAG UPDATE
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { destination, draggableId } = result;

    const updated = tasks.map(t =>
      t.id.toString() === draggableId
        ? { ...t, status: destination.droppableId }
        : t
    );

    setTasks(updated);

    await BASE_URL.put(`tasks/${draggableId}/`, {
      status: destination.droppableId,
    });
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      
       <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
      
        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("tasks")}>Tasks</button>
        <button onClick={() => setActiveTab("projects")}>Projects</button>
        <button onClick={() => setActiveTab("reports")}>Reports</button>
      </aside>
{sidebarOpen && (
  <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
)}
      {/* MAIN */}
      <div className="content">

        <div className="topbar">
          <button 
    className="menu-btn"
    onClick={() => setSidebarOpen(!sidebarOpen)}
  >
    ☰
  </button>
          <h2>Welcome, {dashboard.name || user?.name}</h2>
          <button className="primary" onClick={() => setShowModal(true)}>
            + Create Task
          </button>
        </div>

        {activeTab === "dashboard" && <DashboardHome data={dashboard} />}
       {activeTab === "tasks" && (
  <Tasks
    tasks={tasks}
    setTasks={setTasks}   // 🔥 MUST ADD
    onDragEnd={onDragEnd}
  />
)}
        {activeTab === "projects" && <Projects projects={projects} />}
        {activeTab === "reports" && <Reports tasks={tasks} />}
        {activeTab === "team" && <Team tasks={tasks} />}
      </div>

      {showModal && (
       <CreateTaskModal
  projects={projects}
  onClose={() => setShowModal(false)}
  onCreate={(t) => {
    setTasks(prev => [...prev, t]); // update tasks
    fetchAllData(); // 🔥 refresh dashboard counts
  }}
/>
      )}
      
    </div>
  );
}

////////////////////////////////////////////////////
// DASHBOARD
////////////////////////////////////////////////////
function DashboardHome({ data }) {
  if (!data) return <p>Loading...</p>;

  const pie = [
    { name: "Todo", value: data.todo || 0 },
    { name: "Progress", value: data.in_progress || 0 },
    { name: "Done", value: data.done || 0 }
  ];

  const bar = [
    { name: "Tasks", value: data.total_tasks || 0 },
    { name: "Projects", value: data.total_projects || 0 } // must exist
  ];

  return (
    <div className="grid">
      <Card title="Tasks" value={data.total_tasks || 0} />
      <Card title="To Do" value={data.todo || 0} />
      <Card title="Progress" value={data.in_progress || 0} />
      <Card title="Done" value={data.done || 0} />

      <div className="chart">
        <h4>Task Distribution</h4>
        <ResponsiveContainer height={220}>
          <PieChart>
            <Pie data={pie} dataKey="value" innerRadius={60}>
              <Cell fill="#f59e0b" />
              <Cell fill="#3b82f6" />
              <Cell fill="#22c55e" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart">
        <h4>Overview</h4>
        <ResponsiveContainer height={220}>
          <BarChart data={bar}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function Card({ title, value }) {
  return (
    <div className="card">
      <p>{title}</p>
      <h2>{value || 0}</h2>
    </div>
  );
}

////////////////////////////////////////////////////
// TASKS (IMPROVED)
function Tasks({ tasks, setTasks, onDragEnd }) {
  

  // ✅ ADD DELETE FUNCTION HERE 🔥
  const deleteTask = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      await BASE_URL.delete(`tasks/${id}/`);

      // update UI instantly
      setTasks(prev => prev.filter(t => t.id !== id));

    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const cols = [
    { key: "todo", title: "To Do" },
    { key: "in_progress", title: "In Progress" },
    { key: "done", title: "Completed" }
  ];

  // ✅ FILTER LOGIC
  const filteredTasks = tasks.filter(t => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filter === "done") return t.status === "done";

    if (filter === "today") {
      const today = new Date().toDateString();
      return new Date(t.created_at).toDateString() === today;
    }

    if (filter === "week") {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return new Date(t.created_at) >= weekAgo;
    }

    return true; // all
  });

  // ✅ COMPLETE BUTTON
  const updateStatus = async (id, status) => {
  try {
    await BASE_URL.put(`tasks/${id}/`, { status });

    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status } : t))
    );
  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="tasks-page">

      {/* HEADER */}
      <div className="tasks-header">
        <h2>Task Board</h2>

        <div className="filters">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("today")}>Today</button>
         
          <button onClick={() => setFilter("done")}>Completed</button>
        </div>

        <input
          placeholder="Search tasks..."
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* BOARD */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban">

          {cols.map(col => (
            <Droppable droppableId={col.key} key={col.key}>
              {(p) => (
                <div ref={p.innerRef} {...p.droppableProps} className="column">

                  <div className="column-header">
                    <h4>{col.title}</h4>
                    <span>
                      {filteredTasks.filter(t => t.status === col.key).length}
                    </span>
                  </div>

                  {filteredTasks
                    .filter(t => t.status === col.key)
                    .map((t, i) => (
                      <Draggable key={t.id} draggableId={t.id.toString()} index={i}>
                        {(p) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            className="task-card"
                          >
                            <h5>{t.title}</h5>
                            <p>{t.description}</p>

                           <div className="task-footer">

  <span className={`priority ${t.priority}`}>
    {t.priority}
  </span>

  <div className="task-actions">

  {/* START */}
  {t.status === "todo" && (
    <button
      className="start-btn"
      onClick={() => updateStatus(t.id, "in_progress")}
    >
      ▶ Start
    </button>
  )}

  {/* DONE */}
  {t.status === "in_progress" && (
    <button
      className="done-btn"
      onClick={() => updateStatus(t.id, "done")}
    >
      ✔ Done
    </button>
  )}

  {/* BACK */}
  {t.status === "done" && (
    <button
      className="back-btn"
      onClick={() => updateStatus(t.id, "todo")}
    >
      ↩ Back
    </button>
  )}

  {/* 🔥 DELETE BUTTON */}
  <button
    className="delete-btn"
    onClick={() => deleteTask(t.id)}
  >
    🗑 Delete
  </button>

</div>
</div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {p.placeholder}
                </div>
              )}
            </Droppable>
          ))}

        </div>
      </DragDropContext>
    </div>
  );
}
////////////////////////////////////////////////////
// PROJECTS
////////////////////////////////////////////////////
function Projects({ projects }) {
  return (
    <div className="projects-page">

      <h2 className="page-title">Projects</h2>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          projects.map((p, i) => (
            <div key={p.id} className="project-card">

              <h3>{p.name}</h3>
              <p>{p.description}</p>

              {/* PROGRESS BAR */}
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${(i + 1) * 25}%` }} // demo progress
                ></div>
              </div>

              {/* FOOTER */}
              <div className="project-footer">

                <span className="status active">Active</span>

                {/* AVATARS */}
                <div className="avatars">
                  <img src="https://i.pravatar.cc/30?img=1" />
                  <img src="https://i.pravatar.cc/30?img=2" />
                  <img src="https://i.pravatar.cc/30?img=3" />
                </div>

              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}//////////////////////////////////////
// REPORTS
////////////////////////////////////////////////////



function Reports({ tasks }) {

  const done = tasks.filter(t => t.status === "done").length;
  const progress = tasks.filter(t => t.status === "in_progress").length;
  const todo = tasks.filter(t => t.status === "todo").length;

  const pieData = [
    { name: "Done", value: done },
    { name: "Progress", value: progress },
    { name: "Todo", value: todo }
  ];

  const barData = [
    { name: "Todo", value: todo },
    { name: "Progress", value: progress },
    { name: "Done", value: done }
  ];

  return (
    <div className="reports-page">

      <h2 className="page-title">Reports</h2>

      <div className="reports-grid">

        {/* SUMMARY CARDS */}
        <div className="report-card">
          <h4>Total Tasks</h4>
          <h2>{tasks.length}</h2>
        </div>

        <div className="report-card">
          <h4>Completed</h4>
          <h2>{done}</h2>
        </div>

        <div className="report-card">
          <h4>In Progress</h4>
          <h2>{progress}</h2>
        </div>

        <div className="report-card ">
          <h4>Pending</h4>
          <h2>{todo}</h2>
        </div>

        {/* BAR CHART */}
       <div className="chart-box">
  <h4>Task Overview</h4>

  <ResponsiveContainer height={250}>
    <BarChart data={barData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />

      {/* Bars with individual colors */}
      <Bar dataKey="value">
        <Cell fill="#f59e0b" /> {/* Todo */}
        <Cell fill="#6366f1" /> {/* Progress (purple) */}
        <Cell fill="#22c55e" /> {/* Done */}
      </Bar>

    </BarChart>
  </ResponsiveContainer>
</div>

        {/* PIE CHART */}
        <div className="chart-box">
          <h4>Task Distribution</h4>
          <ResponsiveContainer height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60}>
                <Cell fill="#22c55e" />
                <Cell fill="#3b82f6" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

////////////////////////////////////////////////////
// TEAM
////////////////////////////////////////////////////

function Team({ tasks }) {

  // group tasks by user
  const users = {};

  tasks.forEach(t => {
    const user = t.assigned_to || "User";
    if (!users[user]) users[user] = 0;
    users[user]++;
  });

  return (
    <div className="team-page">

      <h2 className="page-title">Our Team</h2>

      {/* TEAM CARDS */}
      <div className="team-grid">
        {Object.keys(users).map((u, i) => (
          <div className="team-card" key={i}>
            <img src={`https://i.pravatar.cc/100?img=${i+1}`} />
            <h4>{u}</h4>
            <p>{users[u]} Tasks</p>
          </div>
        ))}
      </div>

      {/* TEAM LIST */}
      <div className="team-list">
        <h3>Team Members</h3>

        {Object.keys(users).map((u, i) => (
          <div className="team-row" key={i}>
            <span>{u}</span>
            <span>{users[u]} Tasks</span>
            <span className="active">Active</span>
          </div>
        ))}

      </div>

    </div>
  );
}

////////////////////////////////////////////////////
// CREATE TASK (FIXED 🔥)
////////////////////////////////////////////////////
function CreateTaskModal({ onClose, onCreate, projects }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    project: ""
  });
const handleSubmit = async () => {
  if (!form.title || !form.project) {
    alert("Title & Project required");
    return;
  }

  try {
    // ✅ IMPORTANT: DO NOT SEND assigned_to
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      project: form.project
    };

    console.log("Sending:", payload); // debug

    const res = await BASE_URL.post("tasks/", payload);

    onCreate(res.data);
    onClose();

  } catch (err) {
    console.log(err.response?.data); // 🔥 show backend error
    alert("Error creating task");
  }
  const deleteTask = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  try {
    await BASE_URL.delete(`tasks/${id}/`);

    // ✅ remove from UI instantly
    setTasks(prev => prev.filter(t => t.id !== id));

  } catch (err) {
    console.log(err);
    alert("Error deleting task");
  }
};
};
  return (
    <div className="modal">
      <div className="modal-box">

        <div className="modal-header">
          <h3>Create Task</h3>
          <span onClick={onClose}>✖</span>
        </div>

        <input
          placeholder="Task Title"
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <select onChange={e => setForm({ ...form, project: e.target.value })}>
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select onChange={e => setForm({ ...form, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button className="primary" onClick={handleSubmit}>
          Create Task
        </button>

      </div>
    </div>
  );
}