import express from "express";
const router = express.Router();

router.post("/login", (req, res) => {
  res.json({ message: "login successful" });
});

router.post("/register", (req, res) => {
  res.json({ message: "register successful" });
});

export default router;
