 import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "./auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 🔥 added

  const toastRef = useRef(null);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToast(msg);

    if (toastRef.current) clearTimeout(toastRef.current);

    toastRef.current = setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateName = (name) => /^[A-Za-z ]+$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{7,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (isLogin) {
      if (!validateEmail(form.email)) newErrors.email = "Enter valid email";
      if (!form.password) newErrors.password = "Password required";

      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }

      try {
        setLoading(true);
        showToast("Logging in..."); // 🔥 instant feedback

        const res = await loginUser(form.email, form.password);

        localStorage.setItem("access", res.access);
        localStorage.setItem("refresh", res.refresh);
        const userData = await fetch("https://project-management-backend-yo7k.onrender.com/api/me/",{

       
          headers: {
            Authorization: `Bearer ${res.access}`,
          },
        }).then((res) => res.json());

        localStorage.setItem("user", JSON.stringify(userData));

        window.dispatchEvent(new Event("authChange"));

        showToast("Login successful ✅");

        onLogin();

        setTimeout(() => {
          onClose();
          navigate("/dashboard");
        }, 800);

      } catch (err) {
        setErrors({ password: "Invalid email or password" });
        showToast("Login failed ❌");
      } finally {
        setLoading(false);
      }

    } else {
      if (!validateName(form.name)) newErrors.name = "Only letters allowed";
      if (!validateEmail(form.email)) newErrors.email = "Enter valid email";
      if (!validatePassword(form.password))
        newErrors.password = "Min 7 chars with letter, number & symbol";

      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }

      try {
        setLoading(true);
        showToast("Registering..."); // 🔥 instant feedback

        await registerUser(form.name, form.email, form.password);

        localStorage.setItem(
          "user",
          JSON.stringify({
            name: form.name,
            username: form.email.split("@")[0],
          })
        );

        window.dispatchEvent(new Event("authChange"));

        showToast("User registered successfully ✅");

        setTimeout(() => {
          setIsLogin(true);
          setForm({ name: "", email: "", password: "" });
        }, 500);

      } catch (err) {
        setErrors({ email: "User already exists or invalid data" });
        showToast("Registration failed ❌");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {toast && <div className="toast-popup">{toast}</div>}

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

            {/* PASSWORD FIELD */}
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              {form.password && (
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              )}
            </div>

            {errors.password && <p className="error">{errors.password}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Register"}
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
