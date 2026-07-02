  import express from "express";
  import cors from "cors";
  import dotenv from "dotenv";
  import { connectDB } from "./config/db";
  import userRoutes from "./routes/userRoutes";

  // 1. Initialize configuration values from environmental setup files
  dotenv.config();

  // 2. Instantiate the core Express application pipeline instance
  const app = express();
  const PORT = process.env.PORT || 5000;

  // 3. Establish connectivity links to our persistent MongoDB database cache
  connectDB();

  // 4. Register structural interceptor middleware handlers 
  app.use(cors());          // Enables safe cross-origin resource requests from webviews
  app.use(express.json());  // Automatically parses incoming JSON request bodies

  // 5. Basic Health Check Checkpoint Route Endpoint Definition
  app.get("/health", (req, res) => {
    res.status(200).json({ message: "CP Gym Backend Engine running perfectly." });
  });

  app.use("/api/user", userRoutes);
  // TODO: Import and wire up modular routes here later
  // app.use("/api/user", userRoutes);

  // 6. Fire up the network socket listeners to start serving web requests
  app.listen(PORT, () => {
    console.log(`📡 Server actively listening on address port: http://localhost:${PORT}`);
  });