import "./Help.css";

function HelpCenter() {
  return (
    <div className="help-container">

      <h1 className="help-title">Help Center</h1>
      <p className="help-subtitle">
        Find answers and learn how to use ProjectHub effectively.
      </p>

      {/* INFO CARDS */}
      <div className="help-grid">

        <div className="help-card">
          <h3>Getting Started</h3>
          <p>
            Learn how to create projects, manage tasks, and navigate your dashboard.
          </p>
        </div>

        <div className="help-card">
          <h3>Account & Login</h3>
          <p>
            Manage your account, update profile, and resolve login issues.
          </p>
        </div>

        <div className="help-card">
          <h3>Billing & Plans</h3>
          <p>
            Understand pricing, upgrade plans, and payment details.
          </p>
        </div>

      </div>

      {/* FAQ */}
      <div className="faq-section">
        <h2>Popular Questions</h2>

        <div className="faq-item">
          <h4>How do I create a project?</h4>
          <p>
            Go to your dashboard and click on "Create Project" to get started.
          </p>
        </div>

        <div className="faq-item">
          <h4>How do I assign tasks?</h4>
          <p>
            While creating a task, select a team member in the assign section.
          </p>
        </div>

        <div className="faq-item">
          <h4>How can I upgrade my plan?</h4>
          <p>
            Visit the pricing page and choose the plan that suits your needs.
          </p>
        </div>

      </div>

    </div>
  );
}

export default HelpCenter;