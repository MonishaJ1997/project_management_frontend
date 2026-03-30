import "./Legal.css";

function FAQ() {
  return (
    <div className="legal-container">
      <h1>Frequently Asked Questions</h1>

      <div className="legal-section">
        <h3>1. What is ProjectHub?</h3>
        <p>
          ProjectHub is a task and project management tool that helps teams
          collaborate, track progress, and manage workflows efficiently.
        </p>
      </div>

      <div className="legal-section">
        <h3>2. Is ProjectHub free?</h3>
        <p>
          Yes, we offer a free plan with basic features. Premium plans are
          available for advanced features.
        </p>
      </div>

      <div className="legal-section">
        <h3>3. Can I use it for team collaboration?</h3>
        <p>
          Absolutely! You can assign tasks, track progress, and collaborate
          with your team in real-time.
        </p>
      </div>

      <div className="legal-section">
        <h3>4. Is my data secure?</h3>
        <p>
          Yes, we use secure authentication and encryption to keep your data safe.
        </p>
      </div>

    </div>
  );
}

export default FAQ;