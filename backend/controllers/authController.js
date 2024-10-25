import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import Follow from "../models/followModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      fullname,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser.id, res);

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user.id, res);
    res.status(200).json({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"]}
    });

    const userFollowers = await Follow.findAll({
      where: {
        to_user_id: user.id
      },
      attributes: ["from_user_id"]
    });

    const userFollowing = await Follow.findAll({
      where: {
        from_user_id: user.id
      },
      attributes: ["to_user_id"]
    });

    const followers = userFollowers.map(follower => follower.from_user_id);
    const following = userFollowing.map(following => following.to_user_id);

    const formattedUser = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers,
      following,
      profileImg: user.profileImg,
      coverImg: user.coverImg
    }

    res.status(200).json(formattedUser);
  } catch (error) {
    console.log("Error in getMe controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}