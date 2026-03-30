import "./Legal.css";

function PrivacyPolicy() {
  return (
    <div className="legal-container">
      <h1>Privacy Policy</h1>

      <div className="legal-section">
        <h3>Information We Collect</h3>
        <p>
          We collect basic user information such as name, email, and usage data
          to improve our services.
        </p>
      </div>

      <div className="legal-section">
        <h3>How We Use Data</h3>
        <p>
          Your data is used to provide and improve our platform, personalize
          experience, and ensure security.
        </p>
      </div>

      <div className="legal-section">
        <h3>Data Protection</h3>
        <p>
          We implement strong security measures to protect your personal data.
        </p>
      </div>

      <div className="legal-section">
        <h3>Third-party Sharing</h3>
        <p>
          We do not sell your data. Information is only shared when required by law.
        </p>
      </div>

    </div>
  );
}

export default PrivacyPolicy;