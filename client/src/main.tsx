import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Firebase app
import "@/lib/firebase";

// Register Service Worker for PWA support
import { registerServiceWorker } from "@/utils/serviceWorkerRegistration";

// Initialize app
const rootElement = document.getElementById("root");
createRoot(rootElement!).render(<App />);

// Register service worker after render
registerServiceWorker();
