import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";
import "./club-theme.css";
import "./mc-institutional.css";
import "./mc-app.css";
import "./mc-content.css";
import "./mc-territory.css";
import "./mc-events.css";
import "./mc-communications.css";
import "./mc-journey.css";
import "./mc-documents.css";
import "./mc-garage.css";
import "./mc-finance.css";
import "./mc-video-polish.css";
import "./mc-final-fixes.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider><App /></AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
