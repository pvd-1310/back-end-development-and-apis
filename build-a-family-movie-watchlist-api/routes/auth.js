import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findByUsername } from "../utils/db.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body ?? {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password
  ) {
    return res.status(400).json({
      error: "Username and password are required.",
    });
  }

  try {
   const user = findByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({
            error: "Invalid credentials.",
        });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
});

export default router;