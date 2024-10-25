import bcrypt from "bcryptjs/dist/bcrypt.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import Follow from "../models/followModel.js";
import {v2 as cloudinary} from "cloudinary";
import { Op } from "sequelize";
import { sequelize } from "../db/connectDB.js";
import LikedPost from "../models/likedPostModel.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({
      where: { username },
      attributes: { exclude: ["password"] }
    });

    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }

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

    const userLikedPosts = await LikedPost.findAll({
      where: {
        user_id: user.id
      },
      attributes: ["post_id"]
    });

    const followers = userFollowers.map(follower => follower.from_user_id);
    const following = userFollowing.map(following => following.to_user_id);
    const likedPosts = userLikedPosts.map(likedPost => likedPost.post_id);

    const formattedUser = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers,
      following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      likedPosts
    }

    res.status(200).json(formattedUser);
  } catch (error) {
    console.log("Error in getUserProfile controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToFollow = await User.findByPk(id);
    const currentUser = await User.findByPk(req.user.id);

    if(id === req.user.id.toString()) {
      return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
    }

    // can be changed with uuid validator
    if(!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = await Follow.findOne({
      where: {
        from_user_id: req.user.id,
        to_user_id: id
      }
    });

    console.log(isFollowing);

    if(isFollowing){
      await Follow.destroy({
        where: {
          from_user_id: req.user.id,
          to_user_id: id
        }
      });

      await Notification.destroy({
        where: {
          from_user_id: req.user.id,
          to_user_id: id,
          type: "follow"
        }
      })

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      await Follow.create({
        from_user_id: req.user.id,
        to_user_id: id
      });

      await Notification.create({
        from_user_id: req.user.id,
        to_user_id: id,
        type: "follow"
      });

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const usersFollowedByMe = await Follow.findAll({
      attributes: ["to_user_id"],
      where: {
        from_user_id: userId
      }
    });
    const followedUsersIds = usersFollowedByMe.map((follow) => follow.to_user_id);

    const suggestedUsers = await User.findAll({
      attributes: ["id", "username", "fullname", "profileImg"],
      where: {
        id: {
          [Op.ne]: userId,
          [Op.notIn]: followedUsersIds
        }
      },
      limit: 4,
      order: sequelize.random()
    })

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateUser = async (req, res) => {
  const { username, fullname, email, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user.id;
  
  try {
    let user = await User.findByPk(userId);

    if(!user) {
      res.status(404).json({ error: "User not found" });
    }

    if((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
      return res.status(400).json({ error: "Please provide both current password and new password" });
    }

    if(newPassword && currentPassword){
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if(!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if(newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if(profileImg) {
      if(user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    
    if(coverImg) {
      if(user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
      
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.username = username || user.username;
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user = user.toJSON();
    delete user.password;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}