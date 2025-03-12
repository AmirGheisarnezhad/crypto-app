import { Fragment, useContext } from "react";
import { createRoot } from "react-dom/client";
import { AuthContext, AuthProvider } from "../src/Context/AuthContext";   
import { setupAxiosInterceptors } from "../src/Utils/CryptoService"; 
import RouterComponent from "./Router";
import "@ant-design/v5-patch-for-react-19";
import "./Styles/CssReset.css";

function App() {
  const { logout } = useContext(AuthContext); 
  setupAxiosInterceptors(logout); 
  return <RouterComponent />;
}

createRoot(document.getElementById("root")).render(
  <Fragment>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Fragment>
);
