import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "./auth";
import "./AuthModal.css";

function AuthModal({ isOpen, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  const toastRef = useRef(null); // ✅ FIXED

  if (!isOpen) return null;

  // ✅ TOAST FUNCTION
  const showToast = (msg) => {
    setToast(msg);

    if (toastRef.current) clearTimeout(toastRef.current);

    toastRef.current = setTimeout(() => {
      setToast("");
    }, 3000);
  };

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ✅ VALIDATIONS
  const validateName = (name) => /^[A-Za-z ]+$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{7,}$/.test(password);

  // ✅ SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // ================= LOGIN =================
    if (isLogin) {
      if (!validateEmail(form.email)) newErrors.email = "Enter valid email";
      if (!form.password) newErrors.password = "Password required";

      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }

      try {
        const res = await loginUser(form.email, form.password);

        localStorage.setItem("access", res.access);
        localStorage.setItem("refresh", res.refresh);

        const userData = await fetch("http://127.0.0.1:8000/api/me/", {
          headers: {
            Authorization: `Bearer ${res.access}`,
          },
        }).then((res) => res.json());

        localStorage.setItem("user", JSON.stringify(userData));

        window.dispatchEvent(new Event("authChange"));

        showToast("Login successful");

        onLogin();

        setTimeout(() => {
          onClose();
          navigate("/dashboard");
        }, 800);

      } catch (err) {
        setErrors({ password: "Invalid email or password" });
        showToast("Login failed");
      }
    }

    // ================= REGISTER =================
    else {
      if (!validateName(form.name)) newErrors.name = "Only letters allowed";
      if (!validateEmail(form.email)) newErrors.email = "Enter valid email";
      if (!validatePassword(form.password))
        newErrors.password = "Min 7 chars with letter, number & symbol";

      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }

      try {
        await registerUser(form.name, form.email, form.password);

        localStorage.setItem(
          "user",
          JSON.stringify({
            name: form.name,
            username: form.email.split("@")[0],
          })
        );

        window.dispatchEvent(new Event("authChange"));

        // ✅ SHOW SUCCESS MESSAGE FIRST
        showToast("User registered successfully");

        // ✅ SWITCH TO LOGIN AFTER SHORT DELAY
        setTimeout(() => {
          setIsLogin(true);
          setForm({ name: "", email: "", password: "" });
        }, 500);

      } catch (err) {
        setErrors({ email: "User already exists or invalid data" });
        showToast("Registration failed");
      }
    }
  };

  return (
    <>
      {/* TOAST */}
      {toast && <div className="toast-popup">{toast}</div>}

      {/* MODAL */}
      <div className="modal-overlay">
        <div className="modal-box">
          <button className="close-btn" onClick={onClose}>✖</button>

          <h2>{isLogin ? "Login" : "Register"}</h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="error">{errors.name}</p>}
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}

            <button type="submit" className="submit-btn">
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

export default AuthModal;