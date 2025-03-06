import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext"; // 🔹 اضافه شد
import "../Styles/LoginPage.css";

export default function LoginPage() {
  const { login } = useContext(AuthContext); // 🔹 استفاده از `AuthContext`
  const [isRegistering, setIsRegistering] = useState(false); // 🔹 اضافه شد
  const [formData, setFormData] = useState({
    name: "", // 🔹 مقداردهی اولیه برای جلوگیری از `undefined`
    email: "",
    password: "",
  });
  const formDataToSend = new URLSearchParams();
  formDataToSend.append("grant_type", "password"); // ✅ مقدار صحیح
  formDataToSend.append("username", formData.email);
  formDataToSend.append("password", formData.password);

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
      formDataToSend.append("grant_type", "password"); // ✅ باید مقدار `password` باشد
      formDataToSend.append("username", formData.email); // ✅ `username` همان `email` است
      formDataToSend.append("password", formData.password);

      const response = await axios.post(
        "https://moviesapi.codingfront.dev/oauth/token",
        formDataToSend,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      login(response.data.access_token, response.data.refresh_token);
      setMessage("✅ ورود موفق! در حال انتقال...");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("❌ ورود ناموفق:", error.response?.data || error.message);
      setMessage("❌ خطای ورود: ایمیل یا رمز اشتباه است!");
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
          name: formData.name, // ✅ مقدار `name` باید ارسال شود
          email: formData.email,
          password: formData.password,
        },
        {
          headers: { "Content-Type": "application/json" }, // ✅ `Content-Type` باید `application/json` باشد
        }
      );

      setMessage("✅ ثبت‌نام موفق! حالا وارد شوید.");
      setIsRegistering(false);
    } catch (error) {
      console.error(
        "❌ ثبت‌نام ناموفق:",
        error.response?.data || error.message
      );
      setMessage(
        `❌ ثبت‌نام ناموفق: ${
          error.response?.data?.message || "مشکلی پیش آمد!"
        }`
      );
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? "ثبت‌نام" : "ورود"}</h2>

      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        {isRegistering && (
          <input
            type="text"
            name="name"
            placeholder="نام"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="ایمیل"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="رمز عبور"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "در حال پردازش..." : isRegistering ? "ثبت‌نام" : "ورود"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <p
        onClick={() => setIsRegistering(!isRegistering)}
        className="switch-form"
      >
        {isRegistering
          ? "قبلاً ثبت‌نام کرده‌اید؟ وارد شوید"
          : "حساب کاربری ندارید؟ ثبت‌نام کنید"}
      </p>
    </div>
  );
}
