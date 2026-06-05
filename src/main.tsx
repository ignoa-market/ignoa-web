
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { refreshAccessToken } from "./lib/api";
  import "./styles/index.css";

  refreshAccessToken();

  createRoot(document.getElementById("root")!).render(<App />);
