import "./About.css";

export default function About() {
  return (
    <div className="about-page">

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-left">
          <h1>Helping Teams Achieve More Together</h1>
          <p>
            Empower your workflow with seamless collaboration, task tracking,
            and productivity tools designed for modern teams.
          </p>

          <div className="hero-buttons">
           
           
          </div>
        </div>

        <div className="about-right">
          <img src="/hero.jpg" alt="team working" />
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="story-section">
        <h2>Our Story</h2>
        <p>
          Our journey began with a simple mission — to simplify project management.
          We understand the challenges teams face in coordinating tasks, tracking
          progress, and delivering results. That’s why we built a platform that
          brings everything together in one place.
        </p>

        {/* STATS */}
        <div className="stats">
          <div className="stat-card">
            <h3>5k+</h3>
            <p>Projects Completed</p>
          </div>

          <div className="stat-card">
            <h3>3M+</h3>
            <p>Tasks Managed</p>
          </div>

          <div className="stat-card">
            <h3>99%</h3>
            <p>Client Satisfaction</p>
          </div>

          <div className="stat-card">
            <h3>99%</h3>
            <p>Team Efficiency</p>
          </div>
        </div>
      </section>

    </div>
  );
}