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
const fetchAllData = async () => {
  try {
    const [dashRes, taskRes, projectRes, sprintRes, memberRes] =
      await Promise.all([
        BASE_URL.get("dashboard/"),
        BASE_URL.get("tasks/"),
        BASE_URL.get("projects/"),
        BASE_URL.get("sprints/"),
        BASE_URL.get("members/")
      ]);

    setDashboard(dashRes.data);
    setTasks(taskRes.data);
    setProjects(projectRes.data);
    setSprints(sprintRes.data);
    setMembers(memberRes.data);

    // optional default sprint selection
    if (sprintRes.data.length > 0) {
      setSelectedSprint(sprintRes.data[0]);
    }

  } catch (err) {
    console.log(err);
  }
};
 const [projects, setProjects] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

useEffect(() => {
  fetchAllData();
}, []);



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
      
        <button onClick={() => setActiveTab("sprint")}>Sprint</button>
        <button onClick={() => setActiveTab("calendar")}>Calendar</button>
        <button onClick={() => setActiveTab("team")}>My Teams</button>
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

      {activeTab === "dashboard" && (
  <DashboardHome 
    data={dashboard} 
    tasks={tasks} 
    projects={projects} 
  />
)}
       {activeTab === "tasks" && (
  <Tasks
    tasks={tasks}
    setTasks={setTasks}   // 🔥 MUST ADD
    onDragEnd={onDragEnd}
  />
)}
       {activeTab === "projects" && (
  <Projects 
    projects={projects} 
    setProjects={setProjects} 
    tasks={tasks}  // ✅ ADD THIS
  />
)}
        {activeTab === "reports" && <Reports tasks={tasks} />}
       
        {activeTab === "sprint" && (
  <SprintBoard
    tasks={tasks}
    setTasks={setTasks}
     projects={projects} 
  />
)}{activeTab === "calendar" && <CalendarView tasks={tasks} />}
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
function DashboardHome({ tasks = [], projects = [] }) {

  // ✅ SAFE DEFAULTS
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // ✅ CALCULATIONS
  const total = safeTasks.length;
  const todo = safeTasks.filter(t => t.status === "todo").length;
  const progress = safeTasks.filter(t => t.status === "in_progress").length;
  const done = safeTasks.filter(t => t.status === "done").length;

  // ✅ PIE DATA
  const pie = [
    { name: "Todo", value: todo },
    { name: "Progress", value: progress },
    { name: "Done", value: done }
  ];

  // ✅ BAR DATA
  const bar = [
    { name: "Tasks", value: total },
    { name: "Projects", value: safeProjects.length }
  ];

  // ✅ PROJECT STATS
  const getProjectStats = (projectId) => {
    const projectTasks = safeTasks.filter(t => {
      if (!t.project) return false;

      return typeof t.project === "object"
        ? t.project.id === projectId
        : Number(t.project) === Number(projectId);
    });

    const total = projectTasks.length;

    if (total === 0) {
      return [
        { name: "Completed", value: 0 },
        { name: "Developing", value: 0 },
        { name: "Pending", value: 0 }
      ];
    }

    const done = projectTasks.filter(t => t.status === "done").length;
    const progress = projectTasks.filter(t => t.status === "in_progress").length;
    const pending = projectTasks.filter(t => t.status === "todo").length;

    return [
      { name: "Completed", value: Math.round((done / total) * 100) },
      { name: "Developing", value: Math.round((progress / total) * 100) },
      { name: "Pending", value: Math.round((pending / total) * 100) }
    ];
  };

  return (
    <div className="grid">

      {/* ✅ EMPTY STATE 
      {total === 0 && (
        <p style={{ padding: "20px" }}>
          
        </p>
      )}*/}

      {/* ✅ CARDS */}
      <Card title="Tasks" value={total} />
      <Card title="To Do" value={todo} />
      <Card title="Progress" value={progress} />
      <Card title="Done" value={done} />

      {/* ✅ PIE */}
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

      {/* ✅ BAR */}
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

      {/* ✅ PROJECT PROGRESS */}
      <div className="chart" style={{ gridColumn: "span 2" }}>
        <h4>Project Progress</h4>

        {safeProjects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {safeProjects.map(p => {
              const pdata = getProjectStats(p.id);

              return (
                <div key={p.id} style={{ width: "250px" }}>
                  <h5>{p.name}</h5>

                  <ResponsiveContainer height={180}>
                    <PieChart>
                      <Pie data={pdata} dataKey="value" innerRadius={50}>
                        <Cell fill="#22c55e" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div style={{ fontSize: "12px" }}>
                    {pdata.map((d, i) => (
                      <p key={i}>
                        {d.name}: {d.value}%
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

function Tasks({ tasks, setTasks }) {

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ✅ DELETE (NO BACKEND)
  const deleteTask = async (id) => {
  if (!window.confirm("Delete this task?")) return;

  try {
    await BASE_URL.delete(`tasks/${id}/`);
    setTasks(prev => prev.filter(t => t.id !== id));
  } catch (err) {
    console.log(err);
  }
};

  // ✅ UPDATE STATUS (Start / Done / Back)
  const updateStatus = async (id, status) => {
  try {
    await BASE_URL.patch(`tasks/${id}/`, { status });

    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status } : t
      )
    );
  } catch (err) {
    console.log(err);
  }
};

  // ✅ DRAG DROP
  const onDragEnd = async (result) => {
  if (!result.destination) return;

  const { destination, draggableId } = result;

  try {
    await BASE_URL.patch(`tasks/${draggableId}/`, {
      status: destination.droppableId,
    });

    setTasks(prev =>
      prev.map(t =>
        t.id.toString() === draggableId
          ? { ...t, status: destination.droppableId }
          : t
      )
    );
  } catch (err) {
    console.log(err);
  }
};

  const cols = [
    { key: "todo", title: "To Do" },
    { key: "in_progress", title: "In Progress" },
    { key: "done", title: "Completed" }
  ];

  // ✅ FILTER + SEARCH
  const filteredTasks = tasks.filter(t => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filter === "done") return t.status === "done";

    if (filter === "today") {
      const today = new Date().toDateString();
      return new Date(t.created_at).toDateString() === today;
    }

    return true;
  });

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
                <div
                  ref={p.innerRef}
                  {...p.droppableProps}
                  className="column"
                >

                  <div className="column-header">
                    <h4>{col.title}</h4>
                    <span>
                      {filteredTasks.filter(t => t.status === col.key).length}
                    </span>
                  </div>

                  {filteredTasks
                    .filter(t => t.status === col.key)
                    .map((t, i) => (
                      <Draggable
                        key={t.id}
                        draggableId={t.id.toString()}
                        index={i}
                      >
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

                                {/* DELETE */}
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



function Projects({ projects, setProjects }) {
  const [newProject, setNewProject] = useState("");

  // ✅ SAVE to localStorage
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  // ✅ CREATE PROJECT (with duplicate check)
  const createProject = async () => {
  if (!newProject.trim()) {
    alert("Enter project name");
    return;
  }

  // ✅ Duplicate check
  const isDuplicate = projects.some(
    (p) => p.name.toLowerCase() === newProject.toLowerCase()
  );

  if (isDuplicate) {
    alert("Project name already exists");
    return;
  }

  try {
    const res = await BASE_URL.post("projects/", {
      name: newProject
    });

    setProjects(prev => [...prev, res.data]);
    setNewProject("");

  } catch (err) {
    console.log(err);
  }
};

  // ✅ DELETE PROJECT (with popup + project name)
  const deleteProject = (id) => {
    const project = projects.find((p) => p.id === id);

    if (!window.confirm(`Delete "${project.name}" project?`)) return;

    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="projects-page">
      <h2>Projects</h2>

      {/* ✅ CREATE BOX */}
      <div className="create-box">
        <input
          type="text"
          value={newProject}
          placeholder="Enter project name"
          onChange={(e) => setNewProject(e.target.value)}
        />
        <button onClick={createProject}>Create</button>
      </div>

      {/* ✅ PROJECT LIST */}
      <div className="projects-grid">
        {projects.length === 0 ? (
          <p>No projects</p>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="project-card">
              <button
                className="delete-btn"
                onClick={() => deleteProject(p.id)}
              >
                ✕
              </button>
              <h3>{p.name}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



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


////////////////////////////////////////////////////
// CREATE TASK (FIXED 🔥)
////////////////////////////////////////////////////


function CreateTaskModal({ onClose, onCreate, projects }) {

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "",
    project: ""
  });

  // ✅ CREATE TASK (FRONTEND ONLY)
  
const handleSubmit = async () => {
  if (!form.title || !form.project) {
    alert("Title & Project required");
    return;
  }

  const payload = {
    title: form.title,
    description: form.description || "",
    status: form.status || "todo",
    priority: form.priority || "medium",
    project: Number(form.project),
    assigned_to: null 
  };

  console.log("SENDING:", payload);

  try {
    const res = await BASE_URL.post("tasks/", payload);

    console.log("SUCCESS:", res.data);

    onCreate(res.data);
    onClose();

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    alert(
      err.response?.data
        ? JSON.stringify(err.response.data)
        : "Task creation failed"
    );
  }
};

  return (
    <div className="modal">
      <div className="modal-box">

        <div className="modal-header">
          <h3>Create Task</h3>
          <span onClick={onClose}>✖</span>
        </div>

        {/* TITLE */}
        <input
          placeholder="Task Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        {/* ✅ PROJECT DROPDOWN ONLY */}
        <select
          value={form.project}
          onChange={e => setForm({ ...form, project: e.target.value })}
        >
          <option value="">Select Project</option>

          {projects.length === 0 ? (
            <option disabled>No projects found</option>
          ) : (
            projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))
          )}
        </select>

        {/* PRIORITY */}
        <select
          value={form.priority}
          onChange={e => setForm({ ...form, priority: e.target.value })}
        >
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* BUTTON */}
        <button
          className="primary"
          onClick={handleSubmit}
          disabled={projects.length === 0}
        >
          Create Task
        </button>

        {/* SHOW MESSAGE */}
        {projects.length === 0 && (
          <p style={{ color: "red", marginTop: "10px" }}>
            ⚠ No projects found. Please create a project first.
          </p>
        )}

      </div>
    </div>
  );
}



////////////////////////////////////////////////////
// SPRINT BOARD (ADD ONLY - NO CHANGE ABOVE 🔥)
import {
  LineChart, Line, 
  
} from "recharts";





function SprintBoard({ tasks, setTasks, projects }) {
const fetchTasks = async () => {
  try {
    const res = await BASE_URL.get("tasks/");
    setTasks(res.data);
  } catch (err) {
    console.log(err);
  }
};
  // ================= STATE =================
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);

  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [project, setProject] = useState("");

  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [role, setRole] = useState("");

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchSprints();
    fetchMembers();
  }, []);

  const fetchSprints = async () => {
    try {
      const res = await BASE_URL.get("sprints/");
      setSprints(res.data);
      if (res.data.length > 0) {
        setSelectedSprint(res.data[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await BASE_URL.get("members/");
      setMembers(res.data);
    } catch (err) {
      console.log(err);
    }
  };
const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done"
};
  // ================= CREATE SPRINT =================
  const createSprint = async () => {
    if (!name || !start || !end || !project) {
      alert("All fields required");
      return;
    }

    try {
      const res = await BASE_URL.post("sprints/", {
        name,
        project,
        start_date: start,
        end_date: end,
        status: "PLANNED"
      });

      setSprints(prev => [...prev, res.data]);
      setSelectedSprint(res.data);

      setName("");
      setStart("");
      setEnd("");
      setProject("");

    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE SPRINT =================
  const deleteSprint = async (id) => {
    if (!window.confirm("Delete this sprint?")) return;

    try {
      await BASE_URL.delete(`sprints/${id}/`);

      const updated = sprints.filter(s => s.id !== id);
      setSprints(updated);

      if (selectedSprint?.id === id) {
        setSelectedSprint(updated[0] || null);
      }

    } catch (err) {
      console.log(err);
    }
  };

  // ================= CREATE MEMBER =================
  const createMember = async () => {
    if (!memberName || !role) {
      alert("Enter name and role");
      return;
    }

    try {
      const res = await BASE_URL.post("members/", {
        name: memberName,
        role: role
      });

      setMembers(prev => [...prev, res.data]);

      setMemberName("");
      setRole("");

    } catch (err) {
      console.log(err);
    }
  };

  // ================= ASSIGN TASK =================
 const assignTask = async (taskId, memberId) => {
  try {
    const payload = {
      assigned_to: memberId === "" ? null : Number(memberId)
    };

    console.log("PATCH PAYLOAD:", payload);

    const res = await BASE_URL.patch(`tasks/${taskId}/`, payload);

    setTasks(prev =>
      prev.map(t => (t.id === taskId ? res.data : t))
    );

  } catch (err) {
    console.log("ERROR:", err.response?.data || err);
  }
};

const deleteMember = async (id) => {
  if (!window.confirm("Delete this member?")) return;

  try {
    await BASE_URL.delete(`members/${id}/`);

    // remove from UI
    setMembers(prev => prev.filter(m => m.id !== id));

  } catch (err) {
    console.log(err);
  }
};
  // ================= DRAG =================
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    try {
      const res = await BASE_URL.put(`tasks/${result.draggableId}/`, {
        status: result.destination.droppableId
      });

      setTasks(prev =>
        prev.map(t =>
          t.id.toString() === result.draggableId ? res.data : t
        )
      );

    } catch (err) {
      console.log(err);
    }
  };

  // ================= FILTER =================
  const sprintTasks = tasks.filter(
  t => Number(t.sprint) === Number(selectedSprint?.id)
);

  // ================= UI =================
  return (
    <div className="sprint-page">

      <h2>Sprint Management</h2>

      {/* CREATE SPRINT */}
      <div className="create-sprint">
        <input
          placeholder="Sprint name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <select value={project} onChange={e => setProject(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} />

        <button onClick={createSprint}>Create</button>
      </div>

      {/* SPRINT LIST */}
      <div className="sprint-list">
        {sprints.map(s => (
          <div
            key={s.id}
            className={`sprint-card ${selectedSprint?.id === s.id ? "active" : ""}`}
            onClick={() => setSelectedSprint(s)}
          >
            <h4>{s.name}</h4>
            <p>{s.status}</p>
            <small>{s.start_date} → {s.end_date}</small>

            <button onClick={(e) => {
              e.stopPropagation();
              deleteSprint(s.id);
            }}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* CREATE MEMBER */}
      <h3>Create Member</h3>
      <div className="member-create">
        <input
          placeholder="Member Name"
          value={memberName}
          onChange={e => setMemberName(e.target.value)}
        />

        <input
          placeholder="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
        />

        <button onClick={createMember}>Add Member</button>
      </div>

      {/* MEMBER LIST */}
     <div className="member-list">
  {members.map(m => (
    <div key={m.id} className="member-card">
      {m.name} - {m.role}

      <button
        onClick={() => deleteMember(m.id)}
        style={{ marginLeft: "10px", color: "red" }}
      >
        ✕
      </button>
    </div>
  ))}
</div>
      {/* ASSIGN TASK */}
      {selectedSprint && (
        <>
          <h3>Assign Tasks</h3>

          <div className="task-assign">
            {tasks.map(t => (
             <div key={t.id}>
  {t.title}

  {t.assigned_to_name && (
  <span style={{ marginLeft: "10px", color: "green" }}>
    👤 {t.assigned_to_name}
  </span>
)}

 <select
  value={t.assigned_to || ""}
 onChange={(e) => {
  const value = e.target.value;

  console.log("RAW:", value);
  console.log("TYPE:", typeof value);

  const finalValue = value === "" ? null : Number(value);

  console.log("FINAL:", finalValue, typeof finalValue);

  assignTask(t.id, finalValue);
}}
>
  <option value="">Assign</option>

  {members.map(m => (
    <option key={m.id} value={m.id}>
      {m.name}
    </option>
  ))}
</select>
</div>
            ))}
          </div>

          
        </>
      )}

    </div>
  );
}




function Team({ tasks = [] }) {

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Completed"
};

  const [users, setUsers] = useState([]);

const sprintTeam = JSON.parse(localStorage.getItem("teamData")) || [];

const allUsers = [
  ...users,
  ...sprintTeam.map((m, i) => ({
    id: `local-${i}`,
    username: m.name
  }))
];
  const [view, setView] = useState("summary");

  const now = new Date();
  const last7 = new Date(); last7.setDate(now.getDate() - 7);
  const next7 = new Date(); next7.setDate(now.getDate() + 7);

  const getDate = (d) => d ? new Date(d) : null;

  // 🔥 COUNTS
  const completed = tasks.filter(t => {
    const d = getDate(t.updated_at) || getDate(t.created_at);
    return t.status === "done" && d >= last7;
  }).length;

  const updated = tasks.filter(t => {
    const d = getDate(t.updated_at) || getDate(t.created_at);
    return d >= last7;
  }).length;

  const created = tasks.filter(t => {
    const d = getDate(t.created_at);
    return d >= last7;
  }).length;

  const dueSoon = tasks.filter(t => {
    const d = getDate(t.due_date);
    return d && d >= now && d <= next7;
  }).length;
 useEffect(() => {
    BASE_URL.get("users/")
      .then(res => setUsers(res.data))
      .catch(err => console.log(err));
  }, []);

  const updateAssignee = async (taskId, value) => {
  try {

    // ✅ SPRINT MEMBER (local)
    if (value.startsWith("local-")) {
      const member = allUsers.find(u => u.id === value);

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? {
                ...t,
                assigned_to: member.username,
                assignee: "",
                assignee_id: null
              }
            : t
        )
      );

      return;
    }

    // ✅ API USER
    await BASE_URL.put(`tasks/${taskId}/`, {
      assignee: value
    });

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              assignee_id: value,
              assignee: users.find(u => u.id == value)?.username,
              assigned_to: ""
            }
          : t
      )
    );

  } catch (err) {
    console.log(err);
  }
};
  

const normalizeStatus = (status) => {
  if (!status) return "todo";

  const s = status.toString().toLowerCase().trim();

  if (s.includes("progress")) return "in_progress";
  if (s.includes("done") || s.includes("complete")) return "done";
  if (s.includes("todo")) return "todo";

  return "todo"; // fallback
};
  return (
    <div className="team-page">

      {/* NAV */}
      <div className="team-nav">
        <span onClick={() => setView("summary")} className={view==="summary"?"active":""}>Summary</span>
        <span onClick={() => setView("list")} className={view==="list"?"active":""}>List</span>
        <span onClick={() => setView("board")} className={view==="board"?"active":""}>Board</span>
       
        <span onClick={() => setView("timeline")} className={view==="timeline"?"active":""}>Timeline</span>
      </div>

      {/* ================= SUMMARY ================= */}
      {view === "summary" && (
        <div className="summary-grid">

          <div className="summary-card">
            <h3>{completed}</h3>
            <p>Completed (7 days)</p>
          </div>

          <div className="summary-card">
            <h3>{updated}</h3>
            <p>Updated (7 days)</p>
          </div>

          <div className="summary-card">
            <h3>{created}</h3>
            <p>Created (7 days)</p>
          </div>

          

        </div>
      )}






      {/* ================= LIST ================= 
      {view === "list" && (
        <div className="list-view">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.status}</td>
                  <td>{t.priority}</td>
                  <td>{t.due_date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}*/}

 {view === "list" && (







     





        <div className="list-view">
          <table className="task-table">
            <thead>
              <tr>
                <th>Work</th>
                <th>Assignee</th>
               
               
              
                
                <th>Created</th>
               
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
               <tr key={t.id}>

  {/* WORK */}
  <td className="work-cell">
    <span className="task-title">{t.title}</span>
  </td>

  {/* ASSIGNEE */}
<td>
  <div className="user">
    <div className="avatar">
      {(t.assigned_to_name || "U")[0].toUpperCase()}
    </div>

    <span className="assignee-name">
      {t.assigned_to_name || "Unassigned"}
    </span>
  </div>
</td>
  {/* PRIORITY */}
  
  {/* STATUS ✅ */}
 

  {/* CREATED DATE ✅ */}
  <td>
    {t.created_at
      ? new Date(t.created_at).toLocaleDateString()
      : "—"}
  </td>

</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

 


 
      {/* ================= BOARD ================= */}
      {view === "board" && (
        <div className="kanban">
          {["todo","in_progress","done"].map(col => (
            <div key={col} className="column">
             <h4>{statusLabels[col]}</h4>

              {tasks.filter(t => t.status === col).map(t => (
                <div key={t.id} className="task-card">
                  {t.title}
                </div>
              ))}

            </div>
          ))}
        </div>
      )}

      {/* ================= CALENDAR ================= */}
    

      {/* ================= TIMELINE ================= */}
      {view === "timeline" && (
        <div className="timeline">
          {tasks.map(t => (
            <div key={t.id} className="timeline-item">
            <span>
  {t.created_at
    ? new Date(t.created_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "—"}
</span>
              <p>{t.title}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}



function CalendarView({ tasks = [] }) {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    try {
      const res = await BASE_URL.get("sprints/");
      console.log("SPRINTS:", res.data); // 🔥 DEBUG
      setSprints(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));

  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  // ✅ FIX: strict match
  const getSprint = (id) => {
    if (!id) return null;
    return sprints.find(s => Number(s.id) === Number(id)) || null;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  // ✅ GROUP TASKS
  const groupedTasks = {};

  tasks.forEach((t) => {
    console.log("TASK DATA:", t); // 🔥 DEBUG

    const dateStr = t.due_date || t.created_at;
    if (!dateStr) return;

    const d = new Date(dateStr);
    if (isNaN(d)) return;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    if (!groupedTasks[key]) groupedTasks[key] = [];
    groupedTasks[key].push(t);
  });

  const days = [];

  // empty cells
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={"e" + i} className="calendar-cell empty"></div>);
  }

  // actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayTasks = groupedTasks[key] || [];

    days.push(
      <div key={d} className="calendar-cell">
        <div className="date">{d}</div>

        {dayTasks.length === 0 && (
          <div style={{ fontSize: "10px", color: "#ccc" }}>
            No tasks
          </div>
        )}

        {dayTasks.map((t) => {
          const sprint = getSprint(t.sprint);

          return (
            <div key={t.id} className="task-pill">

              {/* TASK */}
              <strong>{t.title}</strong>

              {/* 🔥 FORCE SHOW RAW SPRINT ID */}
              <div style={{ fontSize: "10px", color: "red" }}>
                Sprint ID: {t.sprint || "NULL"}
              </div>

              {/* ✅ Sprint Name */}
              <div style={{ fontSize: "11px", color: "blue" }}>
                🏁 {sprint ? sprint.name : "No Sprint"}
              </div>

              {/* ✅ Sprint Dates */}
              <div style={{ fontSize: "10px" }}>
                📅 {sprint
                  ? `${formatDate(sprint.start_date)} → ${formatDate(sprint.end_date)}`
                  : "No Dates"}
              </div>

              {/* USER */}
              <div style={{ fontSize: "10px" }}>
                👤 {t.assigned_to_name || "Unassigned"}
              </div>

            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="calendar-page">

      <div className="calendar-header">
        <button onClick={prevMonth}>{"<"}</button>

        <h3>
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>

        <button onClick={nextMonth}>{">"}</button>
      </div>

      <div className="calendar-grid header">
        <div>Sun</div><div>Mon</div><div>Tue</div>
        <div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      <div className="calendar-grid">{days}</div>
    </div>
  );
}