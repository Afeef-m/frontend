import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid = emailReg.test(email) && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please check email and password.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://13.210.33.250/login", { email, password });
      toast.success("Welcome to dashboard!");
      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="container">
      <div className="box">
        <div className="header">
          <h2>Sign in to your Account</h2>
          <h6>Welcome back! please enter your details</h6>
        </div>
        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="options">
              <div className="remember-me">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <a href="#">Forgot password</a>
            </div>
            <button type="submit" disabled={!isFormValid || loading}>
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
