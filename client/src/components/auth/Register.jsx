import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { registerUser } from "../../redux/authSlice";
import users from "../../data/users.json";

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
    name: "",
    role: "guest",
    age: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, email, password, confirmPassword, role, age, phoneNo } = formData;

    // 1. Validations
    if (!name || !email || !password || !confirmPassword || !age || !phoneNo) {
      return setError("Please fill all fields");
    }

    // Name validation: Only letters and spaces, minimum 2 characters
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    if (!nameRegex.test(name)) {
      return setError("Name must contain only letters and spaces (minimum 2 characters)");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please enter a valid email address");
    }

    // Phone number validation: 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNo.replace(/\D/g, ""))) {
      return setError("Phone number must be 10 digits");
    }

    // Age validation: Must be between 18 and 100
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      return setError("Age must be between 18 and 100");
    }
    

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if(password.length < 8){
      return setError("Password cannot be less than 8 letters or number")
    }

    // 2. Check for duplicate email in current localStorage
    const existingUsers = JSON.parse(localStorage.getItem("allUsers")|| "[]") || users.map((user)=>user.email);
    if (existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return setError("This email is already registered.");
    }

    // 3. Prepare User Object
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role,
      age: parseInt(age),
      contactNumber: phoneNo
    };

    // 4. Dispatch to Redux 
    // The Redux slice handles updating the array and saving to localStorage
    dispatch(registerUser(newUser));

    setSuccess("Registration Successful! Please login.");

    // 5. Automatic View Switch
    setTimeout(() => {
      if (onSwitchToLogin) {
        onSwitchToLogin(); // Transitions to Login.jsx via parent/App.jsx navigate
      } else {
        navigate("/login");
      }
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <button onClick={() => navigate("/")} style={styles.closeButton}>
          <FaTimes />
        </button>

        <h2 style={styles.title}>Sign Up</h2>
        
        {error && <p style={styles.error}>{error}</p>}

        {/* Conditional rendering for success */}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Register As</label>
          <select name="role" style={styles.input} value={formData.role} onChange={handleChange}>
            <option value="guest">Guest User</option>
            <option value="manager">Hotel Manager</option>
          </select>

          <label style={styles.label}>Name</label>
          <input name="name" type="text" placeholder="Name" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Age</label>
          <input name="age" type="number" placeholder="Age" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Phone Number</label>
          <input name="phoneNo" type="text" placeholder="Phone Number" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Email Id</label>
          <input name="email" type="email" placeholder="Email" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Password</label>
          <input name="password" type="password" placeholder="Password" style={styles.input} onChange={handleChange} />

          <label style={styles.label}>Confirm Password</label>
          <input name="confirmPassword" type="password" placeholder="Confirm Password" style={styles.input} onChange={handleChange} />

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