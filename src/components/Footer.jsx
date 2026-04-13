import "./Footer.css";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";

function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top
  };

  return (
    <footer className="footer">

      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-col">
          <h2 className="logos">ProjectHub</h2>
          <p>
            Manage tasks, collaborate with your team, and boost productivity with ease.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li onClick={() => handleNavigation("/")}>Home</li>
            <li onClick={() => handleNavigation("/features")}>Features</li>
            <li onClick={() => handleNavigation("/pricing")}>Pricing</li>
            <li onClick={() => handleNavigation("/about")}>About Us</li>
          </ul>
        </div>

        {/* REPLACED COLUMN */}
        <div className="footer-col">
          <h3>Resources</h3>
          <ul>
            <li onClick={() => handleNavigation("/help")}>Help Center</li>
            <li onClick={() => handleNavigation("/faq")}>FAQ</li>
            <li onClick={() => handleNavigation("/privacy")}>Privacy Policy</li>
            <li onClick={() => handleNavigation("/terms")}>Terms & Conditions</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-col">
          <h3>Contact</h3>
          <p>Email: support@projecthub.com</p>
          <p>Phone: +91 98765 43210</p>

          <div className="social-icons">
            <FaFacebookF
              onClick={() => window.open("https://facebook.com", "_blank")}
            />
            <FaTwitter
              onClick={() => window.open("https://twitter.com", "_blank")}
            />
            <FaLinkedinIn
              onClick={() => window.open("https://linkedin.com", "_blank")}
            />
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 ProjectHub. All rights reserved.</p>
      </div>

    </footer>
  );
}

export default Footer;