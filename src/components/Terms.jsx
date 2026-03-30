import "./Legal.css";

function Terms() {
  return (
    <div className="legal-container">
      <h1>Terms & Conditions</h1>

      <div className="legal-section">
        <h3>Usage</h3>
        <p>
          By using ProjectHub, you agree to follow all rules and policies.
        </p>
      </div>

      <div className="legal-section">
        <h3>Account Responsibility</h3>
        <p>
          Users are responsible for maintaining the confidentiality of their accounts.
        </p>
      </div>

      <div className="legal-section">
        <h3>Prohibited Activities</h3>
        <p>
          Misuse of the platform, including unauthorized access or data abuse,
          is strictly prohibited.
        </p>
      </div>

      <div className="legal-section">
        <h3>Changes to Terms</h3>
        <p>
          We may update these terms at any time. Continued use means you accept the changes.
        </p>
      </div>

    </div>
  );
}

export default Terms;