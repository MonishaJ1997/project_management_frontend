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
function DashboardHome({ data, tasks = [], projects = [] }) {
  if (!data) return <p>Loading...</p>;

  const pie = [
    { name: "Todo", value: data.todo || 0 },
    { name: "Progress", value: data.in_progress || 0 },
    { name: "Done", value: data.done || 0 }
  ];

  const bar = [
    { name: "Tasks", value: data.total_tasks || 0 },
    { name: "Projects", value: data.total_projects || 0 }
  ];

  const getProjectStats = (projectId) => {
  const projectTasks = (tasks || []).filter(t => {
    if (!t.project) return false;

    return typeof t.project === "object"
      ? t.project.id === projectId
      : t.project === projectId;
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

      {/* ✅ SAFE PROJECT SECTION */}
      <div className="chart" style={{ gridColumn: "span 2" }}>
        <h4>Project Progress</h4>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {(projects || []).map(p => {
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



function Projects({ projects, setProjects }) {

  const [newProject, setNewProject] = useState("");

  // ✅ SAVE to localStorage
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  // ✅ CREATE PROJECT
  const createProject = () => {
    if (!newProject.trim()) {
      alert("Enter project name");
      return;
    }

    const project = {
      id: Date.now(),
      name: newProject
    };

    setProjects(prev => [...prev, project]);
    setNewProject("");
  };

  // ✅ DELETE PROJECT
  const deleteProject = (id) => {
    if (!window.confirm("Delete this project?")) return;

    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="projects-page">

      <h2>Projects</h2>

      <div className="create-box">
        <input
          type="text"
          value={newProject}
          placeholder="Enter project name"
          onChange={(e) => setNewProject(e.target.value)}
        />
        <button onClick={createProject}>Create</button>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p>No projects</p>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="project-card">
              <button onClick={() => deleteProject(p.id)}>✕</button>
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
  const handleSubmit = () => {
    if (!form.title || !form.project) {
      alert("Title & Project required");
      return;
    }

    const newTask = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      project: form.project,
      created_at: new Date().toISOString()
    };

    onCreate(newTask);
    onClose();
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









function SprintBoard({ tasks, setTasks }) {

  const [sprints, setSprints] = useState([]);
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedSprint, setSelectedSprint] = useState(null);

  const [team, setTeam] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [designation, setDesignation] = useState("");

  // ✅ LOAD DATA (FIXED)
  useEffect(() => {
    const sprintData = JSON.parse(localStorage.getItem("sprintData")) || [];
    const teamData = JSON.parse(localStorage.getItem("teamData")) || [];
    const selected = JSON.parse(localStorage.getItem("selectedSprint"));

    setSprints(sprintData);
    setTeam(teamData);

    // ✅ FIX: restore selected sprint correctly
    if (selected) {
      const found = sprintData.find(s => s.id === selected.id);
      setSelectedSprint(found || sprintData[0] || null);
    } else if (sprintData.length > 0) {
      setSelectedSprint(sprintData[0]);
    }

  }, []);

  // ✅ SAVE SELECTED SPRINT
  useEffect(() => {
    if (selectedSprint) {
      localStorage.setItem("selectedSprint", JSON.stringify(selectedSprint));
    }
  }, [selectedSprint]);

  // ✅ SAVE SPRINTS (FIXED - prevent overwrite empty)
  useEffect(() => {
    if (sprints.length > 0) {
      localStorage.setItem("sprintData", JSON.stringify(sprints));
    }
  }, [sprints]);

  // CREATE SPRINT (FIXED SAVE)
  const createSprint = () => {
    if (!name || !start || !end) return;

    const newSprint = {
      id: Date.now(),
      name,
      start,
      end,
      status: "PLANNED"
    };

    const updated = [...sprints, newSprint];

    setSprints(updated);
    localStorage.setItem("sprintData", JSON.stringify(updated)); // ✅ SAVE

    setSelectedSprint(newSprint);

    setName("");
    setStart("");
    setEnd("");
  };

  // DELETE SPRINT
  const deleteSprint = (id) => {
    const updated = sprints.filter(s => s.id !== id);
    setSprints(updated);

    if (selectedSprint?.id === id) {
      setSelectedSprint(updated[0] || null);
    }
  };

  // ADD MEMBER
  const addMember = () => {
    if (!memberName || !designation) return;

    const updated = [
      ...team,
      { id: Date.now(), name: memberName, role: designation }
    ];

    setTeam(updated);
    localStorage.setItem("teamData", JSON.stringify(updated));

    setMemberName("");
    setDesignation("");
  };

  // DELETE MEMBER
  const deleteMember = (id) => {
    const member = team.find(m => m.id === id);

    const updatedTeam = team.filter(m => m.id !== id);
    setTeam(updatedTeam);
    localStorage.setItem("teamData", JSON.stringify(updatedTeam));

    setTasks(tasks.map(t =>
      t.assigned_to === member?.name
        ? { ...t, assigned_to: "" }
        : t
    ));
  };

  // ASSIGN TASK (OPTIONAL SAVE FIX)
  const assignTask = (taskId, sprintId, member) => {
    const updated = tasks.map(t =>
      t.id === taskId
        ? { ...t, sprint_id: sprintId, assigned_to: member }
        : t
    );

    setTasks(updated);
    localStorage.setItem("tasksData", JSON.stringify(updated)); // ✅ persist tasks
  };

  // DRAG
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const updated = tasks.map(t =>
      t.id.toString() === result.draggableId
        ? { ...t, status: result.destination.droppableId }
        : t
    );

    setTasks(updated);
    localStorage.setItem("tasksData", JSON.stringify(updated)); // ✅ persist
  };

  const sprintTasks = tasks.filter(
    t => t.sprint_id === selectedSprint?.id
  );

  // BURNDOWN
  const burndown = [
    { day: "Start", tasks: sprintTasks.length },
    { day: "Mid", tasks: sprintTasks.filter(t => t.status !== "done").length },
    { day: "End", tasks: sprintTasks.filter(t => t.status === "done").length }
  ];

  return (
    <div className="sprint-page">

      <h2>Sprint Management</h2>

      {/* CREATE */}
      <div className="create-sprint">
        <input placeholder="Sprint name" value={name} onChange={e => setName(e.target.value)} />
        <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        <button onClick={createSprint}>Create</button>
      </div>

      {/* SPRINT LIST */}
      <div className="sprint-list">
        {sprints.map(s => (
          <div key={s.id}
            className={`sprint-card ${selectedSprint?.id === s.id ? "active" : ""}`}
            onClick={() => setSelectedSprint(s)}
          >
            <h4>{s.name}</h4>
            <p>{s.status}</p>
            <small>{s.start} → {s.end}</small>

            <p style={{ fontSize: "10px", color: "gray" }}></p>

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteSprint(s.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {!selectedSprint && <p></p>}

      {selectedSprint && (
        <>
          <h3>Team</h3>

          <div className="team-create">
            <input
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              placeholder="Enter member name"
            />

            <select
              value={designation}
              onChange={e => setDesignation(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Tester">Tester</option>
            </select>

            <button onClick={addMember}>Add</button>
          </div>

          <div className="team-list">
            {team.map(m => (
              <div key={m.id} className="team-avatar">
                <span className="avatar-circle">
                  {m.name?.charAt(0).toUpperCase()}
                </span>
                <span>{m.name}</span>
                <small>{m.role}</small>

                <button
                  className="member-delete"
                  onClick={() => deleteMember(m.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <h3>Workload</h3>
          <div className="workload">
            {team.map(m => {
              const count = sprintTasks.filter(t => t.assigned_to === m.name).length;
              return (
                <div key={m.id} className="work-card">
                  {m.name} <br /> {count} tasks
                </div>
              );
            })}
          </div>

          <h3>Assign Tasks</h3>
          <div className="task-assign">
            {tasks.map(t => (
              <div key={t.id} className="assign-card">
                <span>{t.title}</span>
                <select onChange={e => assignTask(t.id, selectedSprint.id, e.target.value)}>
                  <option>Assign</option>
                  {team.map(m => <option key={m.id}>{m.name}</option>)}
                </select>
              </div>
            ))}
          </div>

          <h3>Sprint Board</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban">
              {["todo", "in_progress", "done"].map(col => (
                <Droppable droppableId={col} key={col}>
                  {(p) => (
                    <div ref={p.innerRef} {...p.droppableProps} className="column">
                      <h4>{col}</h4>

                      {sprintTasks.filter(t => t.status === col).map((t, i) => (
                        <Draggable key={t.id} draggableId={t.id.toString()} index={i}>
                          {(p) => (
                            <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="task-card">
                              {t.title}
                              <p>{t.assigned_to || "Unassigned"}</p>
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

          <h3>Burndown Chart</h3>
          <ResponsiveContainer height={200}>
            <LineChart data={burndown}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>
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
      {(() => {
        const userObj = users.find(u => u.id === t.assignee_id);

        const name =
          typeof t.assigned_to === "string" ? t.assigned_to :
          typeof t.assignee === "string" ? t.assignee :
          userObj?.username || "Unassigned";

        return name.charAt(0).toUpperCase();
      })()}
    </div>

    <span className="assignee-name">
      {(() => {
        const userObj = users.find(u => u.id === t.assignee_id);

        return (
          (typeof t.assigned_to === "string" && t.assigned_to) ||
          (typeof t.assignee === "string" && t.assignee) ||
          userObj?.username ||
          "Unassigned"
        );
      })()}
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
              <h4>{col}</h4>

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



function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sprints, setSprints] = useState([]);

  // ✅ LOAD SPRINTS
  useEffect(() => {
    const sprintData = JSON.parse(localStorage.getItem("sprintData")) || [];
    setSprints(sprintData);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // ✅ GET FULL SPRINT OBJECT
  const getSprint = (sprintId) => {
    return sprints.find(s => Number(s.id) === Number(sprintId));
  };

  // ✅ FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short"
    });
  };

  // ✅ GET TASKS FOR DAY (based on created date)
  const getTasksForDay = (day) => {
    return tasks.filter((t) => {
      if (!t.created_at) return false;
      const d = new Date(t.created_at);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  const days = [];

  // EMPTY CELLS
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={"empty-" + i} className="calendar-cell empty"></div>);
  }

  // DAYS
  for (let d = 1; d <= daysInMonth; d++) {
    const dayTasks = getTasksForDay(d);

    days.push(
      <div key={d} className="calendar-cell">
        <div className="date">{d}</div>

        {dayTasks.map((t) => {
          const sprint = getSprint(t.sprint_id);

          return (
            <div key={t.id} className="task-pill">
              <strong>{t.title}</strong>

              <div style={{ fontSize: "10px" }}>
                🏁 {sprint?.name || "No Sprint"}
              </div>

              <div style={{ fontSize: "10px" }}>
                📅 {sprint
                  ? `${formatDate(sprint.start)} → ${formatDate(sprint.end)}`
                  : "-"}
              </div>

              <div style={{ fontSize: "10px" }}>
                👤 {t.assigned_to || "Unassigned"}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="calendar-page">

      {/* HEADER */}
      <div className="calendar-header">
        <button onClick={prevMonth}>{"<"}</button>
        <h3>
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <button onClick={nextMonth}>{">"}</button>
      </div>

      {/* WEEK NAMES */}
      <div className="calendar-grid header">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* DAYS */}
      <div className="calendar-grid">{days}</div>
    </div>
  );
}