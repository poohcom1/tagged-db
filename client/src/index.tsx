import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { PageRoutes } from "./routes";
import Modal from "react-modal";
import { setupTabFocusDetection } from "./utils/tabFocus";
import { PopupAlert } from "./components/PopupAlert";

Modal.setAppElement("#root");

setupTabFocusDetection();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <PageRoutes />
    <PopupAlert />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
