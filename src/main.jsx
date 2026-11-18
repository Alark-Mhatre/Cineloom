import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* errorBoundary shows fallback UI instead of crashing the entire UI */}
    <ErrorBoundary> 
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
