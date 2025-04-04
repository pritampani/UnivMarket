import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import imgbbRouter from "./api/imgbb";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for UniMarket
  
  // Register ImgBB API routes
  app.use("/api/imgbb", imgbbRouter);
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
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

  // Serve Firebase config
  app.get("/api/config/firebase", (req, res) => {
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

  // Add endpoint to check ImgBB API key status
  app.get("/api/config/imgbb-status", (req, res) => {
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

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
