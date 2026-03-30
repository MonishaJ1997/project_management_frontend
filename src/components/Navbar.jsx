import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes,FaChevronDown } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ NEW: DROPDOWN STATE
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("access"));
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    };

    handleAuthChange();

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  // ✅ CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      alert("Already logged in!");
    } else {
      setShowModal(true);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);

    const token = localStorage.getItem("access");

    fetch("http://127.0.0.1:8000/api/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      });

    setShowModal(false);
  };

  return (
    <div className="navbar">

      {/* LEFT */}
      <div className="nav-left">
        <h2 className="logo">ProjectHub</h2>
      </div>

      {/* TOGGLE */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* LINKS */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/features" onClick={() => setMenuOpen(false)}>Features</NavLink>
        <NavLink to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>About Us</NavLink>
      </div>

      {/* RIGHT */}
      <div className={`nav-right ${menuOpen ? "active" : ""}`}>

        {!isLoggedIn ? (
          <button className="login-btn" onClick={handleGetStarted}>
            Log In
          </button>
        ) : (
          <div className="user-dropdown" ref={dropdownRef}>
            
            {/* CLICKABLE USER */}
            <div
              className="username"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              👤 {user?.name || "User"}
              <FaChevronDown className={`dropdown-icon ${dropdownOpen ? "rotate" : ""}`} />
            </div>

            {/* DROPDOWN MENU */}
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div onClick={() => navigate("/dashboard")}>
                  Dashboard
                </div>
                <div onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default Navbar;