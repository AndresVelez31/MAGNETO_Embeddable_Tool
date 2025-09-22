import { StrictMode } from "react";
import App from "./app";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")! as HTMLElement).render(<StrictMode><App /></StrictMode>);

