import express from "express";
import dotenv from "dotenv";
import connectdb from "./config/db.js";
import cors from "cors";
import recipeRoutes from "./routes/recipeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectdb();
const PORT = process.env.PORT || 5000;

const app = express();
// allows frontend (port 5173) to communicate with backend (port 5000)

//middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // body parser for form data

// recipe route integration
app.use("/api/recipes", recipeRoutes); // mounts recipe routes (CRUD & Search)
app.use("/api/users", userRoutes); // mounts user routes (Register & Login)

// catches requests that didn't match any route
app.use(notFound);
// middleware error handler (must be after routes)
app.use(errorHandler);

//server start
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
