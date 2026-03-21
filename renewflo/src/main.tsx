import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/app/App";

// Listen for auth token from parent Flow shell (iframe embedding)
window.addEventListener("message", (event) => {
  const allowedOrigins = [
    "https://flow.kitz.services",
    "https://kitz-flow-kenroachs-projects.vercel.app",
    "http://localhost:4000",
    "http://localhost:3000",
  ];
  if (!allowedOrigins.includes(event.origin)) return;

  if (event.data?.type === "rf_auth" && event.data?.token) {
    localStorage.setItem("rf_token", event.data.token);
    window.dispatchEvent(new Event("rf_auth_updated"));
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
