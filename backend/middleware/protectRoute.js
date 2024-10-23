import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if(!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(!decoded){
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"]}
    });

    if(!user) {
      return res.status(401).json({ error: "Unauthorized: User Not Found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
