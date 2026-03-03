import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

const styles = {
  container: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px", background: "#f9f9f9" },
  box: { position: "relative", backgroundColor: "#fff", padding: "30px 25px", borderRadius: "12px", width: "100%", maxWidth: "400px", textAlign: "center", boxShadow: "0px 8px 20px rgba(0,0,0,0.15)" },
  title: { marginBottom: "15px", color: "#000", fontSize: "28px", fontWeight: "bold" },
  label: { display: "block", marginBottom: "4px", fontWeight: "bold", color: "#333", fontSize: "13px", textAlign: "left" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", marginBottom: "12px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "16px", outline: "none" },
  button: { width: "100%", padding: "12px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "10px" },
  text: { marginTop: "15px", color: "#000", fontSize: "14px" },
  linkBtn: { color: "#000", fontWeight: "bold", textDecoration: "none", background: "none", border: "none", cursor: "pointer", marginLeft: "5px", fontSize: "14px" },
  error: { color: "red", marginBottom: "10px", fontSize: "13px" },
  success: { color: "green", marginBottom: "10px", fontSize: "13px" },
  closeButton: { position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#333", display: "flex", alignItems: "center", justifyContent: "center", padding: "5px" },
};

const Register = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    Name: "",
    Role: "guest",
    Email: "",
    ContactNumber: "",
    Password: "",
    ConfirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { Name, Email, Password, ConfirmPassword, Role, ContactNumber } = formData;

    if (!Name || !Email || !Password || !ConfirmPassword || !ContactNumber) {
      return setError("Please fill all fields");
    }

    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    if (!nameRegex.test(Name)) {
      return setError("Name must contain only letters and spaces (minimum 2 characters)");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return setError("Please enter a valid email address");
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(ContactNumber.replace(/\D/g, ""))) {
      return setError("Contact number must be 10 digits");
    }

    if (Password !== ConfirmPassword) {
      return setError("Passwords do not match");
    }

    if (Password.length < 8) {
      return setError("Password cannot be less than 8 letters or number");
    }

    const payload = { Name, Email, Password, ConfirmPassword, Role, ContactNumber };

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("User saved to Database successfully!");
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          } else {
            navigate('/login');
          }
        }, 1500);
        return;
      } else {
        return setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Full error object:", err);
      setError("Could not connect to server. Check if backend is running.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <button onClick={() => navigate("/")} style={styles.closeButton}>
          <FaTimes />
        </button>

        <h2 style={styles.title}>Sign Up</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Register As</label>
          <select name="Role" style={styles.input} value={formData.Role} onChange={handleChange}>
            <option value="guest">Guest User</option>
            <option value="manager">Hotel Manager</option>
          </select>

          <label style={styles.label}>Name</label>
          <input name="Name" type="text" placeholder="Name" autoComplete="name" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Contact Number</label>
          <input name="ContactNumber" type="text" placeholder="Contact Number" autoComplete="tel" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Email Id</label>
          <input name="Email" type="email" placeholder="Email" autoComplete="email" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Password</label>
          <input name="Password" type="password" placeholder="Password" autoComplete="new-password" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Confirm Password</label>
          <input name="ConfirmPassword" type="password" placeholder="Confirm Password" autoComplete="new-password" style={styles.input} onChange={handleChange} />

          <button type="submit" style={styles.button}>Register</button>
        </form>

        <p style={styles.text}>
          Already have an account?
          <button type="button" onClick={onSwitchToLogin} style={styles.linkBtn}>Login</button>
        </p>
      </div>
    </div>
  );
};

export default Register;
