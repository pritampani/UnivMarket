// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/api/imgbb.ts
import { Router } from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
var router = Router();
var upload = multer({
  dest: "temp/",
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No image file provided" });
    }
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return res.status(500).json({ success: false, error: "ImgBB API key not configured" });
    }
    const fileData = fs.readFileSync(req.file.path);
    const form = new FormData();
    form.append("key", imgbbApiKey);
    form.append("image", fileData, {
      filename: `${uuidv4()}_${path.basename(req.file.originalname)}`,
      contentType: req.file.mimetype
    });
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: form
    });
    const result = await response.json();
    fs.unlinkSync(req.file.path);
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error?.message || "Failed to upload image to ImgBB"
      });
    }
    return res.json({
      success: true,
      data: {
        url: result.data?.url,
        delete_url: result.data?.delete_url,
        display_url: result.data?.display_url,
        thumbnail: result.data?.thumb?.url || null
      }
    });
  } catch (error) {
    console.error("Error uploading to ImgBB:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
});
var imgbb_default = router;

// server/routes.ts
async function registerRoutes(app2) {
  app2.use("/api/imgbb", imgbb_default);
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories = [
        { id: "books", name: "Books", icon: "book" },
        { id: "electronics", name: "Electronics", icon: "laptop" },
        { id: "furniture", name: "Furniture", icon: "chair" },
        { id: "clothing", name: "Clothing", icon: "clothing" },
        { id: "stationery", name: "Stationery", icon: "edit" },
        { id: "gaming", name: "Gaming", icon: "gamepad" },
        { id: "more", name: "More", icon: "more" }
      ];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/config/firebase", (req, res) => {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || "",
      authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com` || "",
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com` || "",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_APP_ID || ""
    };
    res.json(firebaseConfig);
  });
  app2.get("/api/config/imgbb-status", (req, res) => {
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return res.json({
        configured: false,
        message: "ImgBB API key is not configured"
      });
    }
    return res.json({
      configured: true,
      message: "ImgBB API key is configured"
    });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
