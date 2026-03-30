import BASE_URL from "../api";

// ================= LOGIN =================
export const loginUser = async (email, password) => {
  try {
    const res = await BASE_URL.post("login/", {
      username: email,   // ✅ send email as "username"
      password: password,
    });

    // ✅ STORE TOKENS
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    return res.data;

  } catch (err) {
    console.error("LOGIN ERROR:", err.response?.data); // 🔥 DEBUG
    throw err.response?.data || { error: "Login failed" };
  }
};


// ================= REGISTER =================
export const registerUser = async (name, email, password) => {
  try {
    const res = await BASE_URL.post("register/", {
      name: name,                 // ✅ goes to first_name
      username: email,            // 🔥 IMPORTANT FIX
      email: email,
      password: password,
    });

    return res.data;

  } catch (err) {
    console.error("REGISTER ERROR:", err.response?.data); // 🔥 DEBUG
    throw err.response?.data || { error: "Registration failed" };
  }
};