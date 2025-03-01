import { Fragment } from "react";
import { createRoot } from "react-dom/client";
import RouterComponent from "./Router";
import "@ant-design/v5-patch-for-react-19";
import "./Styles/CssReset.css"

createRoot(document.getElementById("root")).render(
  
    <Fragment>
      <RouterComponent />
    </Fragment>
  
);
