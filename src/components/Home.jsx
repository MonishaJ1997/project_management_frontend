import { useEffect, useState } from "react";

import BASE_URL from "../api";
import "./Home.css";
import Testimonial from "../components/Testimonial";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import { FiZap, FiUsers, FiBarChart2 } from "react-icons/fi";
function Home() {
const [image, setImage] = useState("");
const [showModal, setShowModal] = useState(false);

const navigate = useNavigate();
const handleGetStarted = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    navigate("/dashboard"); // ✅ logged in
  } else {
    setShowModal(true); // ❌ not logged in
  }
};


const handleLogin = () => {
  console.log("User logged in");
};
  useEffect(() => {
    fetch(`${URL}hero/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setImage(data[0].image);
        }
      });
  }, []);

  return (
    <div className="home">
     

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <h1>Streamline Your Projects, Boost Your Productivity</h1>

          <p>
            Manage tasks, collaborate with your team, and achieve your goals efficiently.
          </p>

          <div className="buttons">
           <button className="primary" onClick={handleGetStarted}>
  Get Started Now
</button>
            
          </div>
        </div>

        <div className="hero-right">
          <img src="/hero.jpg" alt="hero" />
        </div>
      </section>

      {/* FEATURES SECTION */}
{/* FEATURES SECTION */}
<div className="features-modern-home">
  <div className="features-wrapper-modern">

    {/* LEFT */}
    <div className="features-left-modern">
      <h2>Everything you need to manage projects</h2>
      <p>
        Plan, track, and deliver your projects efficiently with powerful tools designed for teams.
      </p>

      <button className="cta-btn-modern" onClick={() => navigate("/features")}>
        Explore Features
      </button>
    </div>

    {/* RIGHT */}
    <div className="features-right-modern">

      <div className="feature-card-modern-home">
        <div className="icon-box-modern">
          <FiZap />
        </div>
        <div>
          <h3>Fast Task Control</h3>
          <p>Manage tasks with speed and precision.</p>
        </div>
      </div>

      <div className="feature-card-modern-home">
        <div className="icon-box-modern">
          <FiUsers />
        </div>
        <div>
          <h3>Team Collaboration</h3>
          <p>Work together seamlessly with your team.</p>
        </div>
      </div>

      <div className="feature-card-modern-home">
        <div className="icon-box-modern">
          <FiBarChart2 />
        </div>
        <div>
          <h3>Smart Insights</h3>
          <p>Track progress and improve productivity.</p>
        </div>
      </div>

    </div>

  </div>
</div>
      
<Testimonial/>
   <AuthModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onLogin={handleLogin}
/>
    </div>



  );
  
 
}




export default Home;