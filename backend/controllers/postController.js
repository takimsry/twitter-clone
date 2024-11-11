import { Op } from "sequelize";
import Comment from "../models/commentModel.js";
import LikedPost from "../models/likedPostModel.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import Follow from "../models/followModel.js";
import { formatPosts } from "../lib/utils/formatPosts.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user.id.toString();

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Please provide text or image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = await Post.create({
      user_id: userId,
      text,
      img
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user_id.toString() !== req.user.id.toString()) {
      return res.status(401).json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.destroy({ where: { id: req.params.id } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Please provide text" });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await Comment.create({
      post_id: postId,
      user_id: userId,
      text
    })

    const updatedComments = await Comment.findAll({
      include: {
        model: User,
        attributes: ["id", "username", "fullname", "profileImg"]
      },
      where: { post_id: postId}
    });

    const formattedUpdatedComments = updatedComments.map(comment => {
      return {
        id: comment.id,
        text: comment.text,
        user: {
          id: comment.User.id,
          username: comment.User.username,
          fullname: comment.User.fullname,
          profileImg: comment.User.profileImg
        }
      }
    })

    res.status(200).json(formattedUpdatedComments);
  } catch (error) {
    console.log("Error in commentOnPost controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = await LikedPost.findOne({
      where: {
        post_id: postId,
        user_id: userId
      }
    });

    if (userLikedPost) {
      await LikedPost.destroy({ 
        where: { 
          user_id: userId, 
          post_id: postId 
        } 
      });

      if (post.user_id !== userId) {
        await Notification.destroy({
          where: {
            from_user_id: userId,
            to_user_id: post.user_id,
            type: "like"
          }
        });
      }

      const updatedLikes = await LikedPost.findAll({
        attributes: ["user_id"],
        where: {
          post_id: postId
        },
      });

      const formattedUpdatedLikes = updatedLikes.map(like => like.user_id);

      res.status(200).json(formattedUpdatedLikes);
    } else {
      await LikedPost.create({
        post_id: postId,
        user_id: userId
      });
      
      if (post.user_id !== userId) {
        await Notification.create({
          from_user_id: userId,
          to_user_id: post.user_id,
          type: "like"
        });
      }

      const updatedLikes = await LikedPost.findAll({
        attributes: ["user_id"],
        where: {
          post_id: postId
        }
      });

      const formattedUpdatedLikes = updatedLikes.map(like => like.user_id);

      res.status(200).json(formattedUpdatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username", "fullname", "profileImg"]
        },
        {
          model: LikedPost,
          attributes: ["user_id"]
        },
        {
          model: Comment,
          attributes: ["id", "text"],
          include: {
            model: User,
            attributes: ["id", "username", "fullname", "profileImg"]
          }
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    const formattedPosts = formatPosts(posts);

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.log("Error in getAllPosts controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const idLikedPosts = await LikedPost.findAll({
      attributes: ["post_id"],
      where: {
        user_id: userId
      }
    });
    const formattedIdLikedPosts = idLikedPosts.map(post => post.post_id);

    const likedPosts = await Post.findAll({
      where: {
        id: {
          [Op.in]: formattedIdLikedPosts
        }
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "fullname", "profileImg"]
        },
        {
          model: LikedPost,
          attributes: ["user_id"]
        },
        {
          model: Comment,
          attributes: ["id", "text"],
          include: {
            model: User,
            attributes: ["id", "username", "fullname", "profileImg"]
          }
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const formattedLikedPosts = formatPosts(likedPosts);

    res.status(200).json(formattedLikedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const idFollowing = await Follow.findAll({
      attributes: ["to_user_id"],
      where: {
        from_user_id: userId
      }
    });
    const formattedIdFollowing = idFollowing.map(following => following.to_user_id);

    const followingPosts = await Post.findAll({
      where: {
        user_id: {
          [Op.in]: formattedIdFollowing
        }
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "fullname", "profileImg"]
        },
        {
          model: LikedPost,
          attributes: ["user_id"]
        },
        {
          model: Comment,
          attributes: ["id", "text"],
          include: {
            model: User,
            attributes: ["id", "username", "fullname", "profileImg"]
          }
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const formattedFollowingPosts = formatPosts(followingPosts);

    res.status(200).json(formattedFollowingPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userPosts = await Post.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: User,
          attributes: ["id", "username", "fullname", "profileImg"]
        },
        {
          model: LikedPost,
          attributes: ["user_id"]
        },
        {
          model: Comment,
          attributes: ["id", "text"],
          include: {
            model: User,
            attributes: ["id", "username", "fullname", "profileImg"]
          }
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const formattedUserPosts = formatPosts(userPosts);

    res.status(200).json(formattedUserPosts);
  } catch (error) {
    console.log("Error in getUserPosts controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}