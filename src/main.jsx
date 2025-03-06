import { Fragment, useContext } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, AuthContext } from "../src/Context/AuthContext"; // 🔹 اضافه شد
import { setupAxiosInterceptors } from "../src/Utils/CryptoService"; // 🔹 اضافه شد
import RouterComponent from "./Router";
import "@ant-design/v5-patch-for-react-19";
import "./Styles/CssReset.css";

function App() {
  const { logout } = useContext(AuthContext); // دسترسی به تابع `logout`
  setupAxiosInterceptors(logout); // مقداردهی `Interceptor`
  return <RouterComponent />;
}

createRoot(document.getElementById("root")).render(
  <Fragment>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Fragment>
);
