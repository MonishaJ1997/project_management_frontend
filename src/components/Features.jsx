import "./Features.css";
import { 
  FiCheckSquare, 
  FiColumns, 
  FiUsers, 
  FiBarChart2, 
  FiShield, 
  FiBell 
} from "react-icons/fi";

export default function Features() {
  const features = [
    {
      title: "Task & Issue Management",
      desc: "Create, assign, and track tasks with priorities and deadlines.",
      icon: <FiCheckSquare />,
    },
    {
      title: "Kanban & Sprint Boards",
      desc: "Visualize workflows with drag-and-drop boards.",
      icon: <FiColumns />,
    },
    {
      title: "Team Collaboration",
      desc: "Work together in real-time with your team.",
      icon: <FiUsers />,
    },
    {
      title: "Reports & Analytics",
      desc: "Gain insights with powerful analytics.",
      icon: <FiBarChart2 />,
    },
    {
      title: "Security & Permissions",
      desc: "Role-based access control for safety.",
      icon: <FiShield />,
    },
    {
      title: "Notifications",
      desc: "Stay updated with instant alerts.",
      icon: <FiBell />,
    },
  ];

  return (
    <section className="features-modern">
      <div className="features-header">
        <h2>Powerful Features</h2>
        <p>
          Everything you need to manage projects efficiently and scale your team.
        </p>
      </div>

      <div className="features-grid-modern">
        {features.map((item, index) => (
          <div className="feature-card-modern" key={index}>
            <div className="icon-box">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}