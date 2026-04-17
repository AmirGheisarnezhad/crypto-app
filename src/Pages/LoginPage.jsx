import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import "../Styles/LoginPage.css";

export default function LoginPage() {
  const { login } = useContext(AuthContext); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [formData, setFormData] = useState({
    name: "", 
    email: "",
    password: "",
  });
  // const formDataToSend = new URLSearchParams();
  // formDataToSend.append("grant_type", "password"); 
  // formDataToSend.append("username", formData.email);
  // formDataToSend.append("password", formData.password);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append("grant_type", "password"); 
      formDataToSend.append("username", formData.email); 
      formDataToSend.append("password", formData.password);

      const response = await axios.post(
        "https://moviesapi.codingfront.dev/oauth/token",
        formDataToSend,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      login(response.data.access_token, response.data.refresh_token);
      setMessage("✅ Successful login! Transferring...");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      setMessage("❌ Login error: Incorrect email or password!");
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "https://moviesapi.codingfront.dev/api/v1/register",
        {
          name: formData.name, 
          email: formData.email,
          password: formData.password,
        },
        {
          headers: { "Content-Type": "application/json" }, 
        }
      );

      setMessage("✅ Registration successful! Log in now.");
      setIsRegistering(false);
    } catch (error) {
      console.error(
        "❌ Registration failed:",
        error.response?.data || error.message
      );
      setMessage(
        `❌ Registration failed: ${
          error.response?.data?.message || " There's a problem!"
        }`
      );
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? "Register" : "login"}</h2>

      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        {isRegistering && (
          <input
            type="text"
            name="name"
            placeholder="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder=" Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : isRegistering ? "registration" : "login"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <p
        onClick={() => setIsRegistering(!isRegistering)}
        className="switch-form"
      >
        {isRegistering
          ? "Already registered? Sign in"
          : "Don't have an account? Register"}
      </p>
    </div>
  );
}
