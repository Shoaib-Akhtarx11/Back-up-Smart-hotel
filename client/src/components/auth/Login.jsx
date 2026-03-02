import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import userData from "../../data/users.json"; // This imports your 4 admins

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f4",
    padding: "20px",
  },
  box: {
    position: "relative",
    backgroundColor: "#fff",
    padding: "40px 30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "20px",
    color: "#000",
    fontSize: "28px",
    fontWeight: "bold",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#000",
    fontSize: "14px",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "10px",
  },
  text: { marginTop: "15px", color: "#666", fontSize: "14px" },
  linkBtn: {
    color: "#000",
    fontWeight: "bold",
    textDecoration: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    marginLeft: "5px",
  },
  error: { color: "red", marginBottom: "10px", fontSize: "14px" },
  closeButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#333",
  },
};

const Login = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guest");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const redirectTo = location?.state?.redirectTo;
  const messageFromState = location?.state?.message;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // 1. Combine Databases: JSON Admins + LocalStorage Users
    const registeredUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
    const allUsers = [...userData, ...registeredUsers];

    // 2. Find User (Case-insensitive email check)
    const foundUser = allUsers.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );

    if (foundUser) {
      // 3. Validate Role
      if (foundUser.role !== role) {
        return setError(
          `Mismatch: This account is registered as ${foundUser.role}.`,
        );
      }

      // 4. Transform user object - ensure firstName and lastName are always set
      const fullName = foundUser.firstName && foundUser.lastName 
        ? `${foundUser.firstName} ${foundUser.lastName}`
        : foundUser.name || 'User';
      
      const nameParts = fullName.split(' ');
      const firstName = foundUser.firstName || nameParts[0] || 'User';
      const lastName = foundUser.lastName || nameParts.slice(1).join(' ') || '';

      const userForDispatch = {
        ...foundUser,
        firstName,
        lastName,
        name: fullName, // Keep original name field too
      };

      // Debug log

      // 5. Dispatch Login
      dispatch(login({ user: userForDispatch, role: role }));

      // 6. Success Callback & Role-Based Redirection
      if (onSuccess) onSuccess();

      // Check if user was trying to book - redirect them back
      if (redirectTo) {
        navigate(redirectTo);
      } else if (userForDispatch.role === "admin") {
        navigate("/admin");
      } else if (userForDispatch.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/");
      }
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <button onClick={() => navigate("/")} style={styles.closeButton}>
          <FaTimes />
        </button>
        <h2 style={styles.title}>Login</h2>
        {messageFromState && (
          <p style={{ color: "blue", marginBottom: "10px", fontSize: "14px" }}>
            {messageFromState}
          </p>
        )}
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Login As</label>
          <select
            style={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="guest">Guest User</option>
            <option value="manager">Hotel Manager</option>
            <option value="admin">System Admin</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
        <p style={styles.text}>
          Don't have an account?
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={styles.linkBtn}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
