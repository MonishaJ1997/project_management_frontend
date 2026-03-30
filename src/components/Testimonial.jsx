import "./Testimonial.css";
import AuthModal from "../components/AuthModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function Testimonial() {
  const [showModal, setShowModal] = useState(false);
  

const navigate = useNavigate();

const handleGetStarted = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    navigate("/dashboard");
  } else {
    setShowModal(true);
  }
};
  const handleLogin = () => {
    setIsLoggedIn(true);

    // fetch user again after login
    const token = localStorage.getItem("access");

    fetch("http://127.0.0.1:8000/api/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      });

    setShowModal(false);
  };

  return (
    <div className="testimonial-section">

      {/* TITLE */}
      <h2 className="title">What Our Clients Say</h2>

      {/* CARDS */}
      <div className="testimonial-container">

        {/* CARD 1 */}
        <div className="testimonial-card">
          <div className="top">
            <img src="https://i.pravatar.cc/50?img=5" alt="user" />
            <div>
              <h4>Lily Roberts</h4>
              <span>⭐⭐⭐⭐⭐</span>
            </div>
          </div>
          <p>
            "ProjectHub has transformed the way we work. Our team is more productive than ever!"
          </p>
        </div>

        {/* CARD 2 */}
        <div className="testimonial-card">
          <div className="top">
            <img src="https://i.pravatar.cc/50?img=12" alt="user" />
            <div>
              <h4>Mark Thompson</h4>
              <span>⭐⭐⭐⭐⭐</span>
            </div>
          </div>
          <p>
            "An essential tool for managing multiple projects seamlessly."
          </p>
        </div>

      </div>

      {/* CTA SECTION */}
      <div className="cta">
        <h2>Ready to Get Started?</h2>
        <p>Try ProjectHub for free and take your projects to the next level!</p>

        <div className="cta-buttons">
          <button className="primary" onClick={handleGetStarted}>
  Get Started Now
</button>
         
        </div>
      </div>
  <AuthModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onLogin={handleLogin}
/>
    </div>
  );
}

export default Testimonial;