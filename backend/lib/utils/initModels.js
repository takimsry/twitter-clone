import User from '../../models/userModel.js';
import Follow from '../../models/followModel.js';
import LikedPost from '../../models/likedPostModel.js';
import Post from '../../models/postModel.js';
import Comment from '../../models/commentModel.js';
import Notification from '../../models/notificationModel.js';

export const initModels = () => {
  User.hasMany(Follow, { foreignKey: 'to_user_id', as: 'Followers' });
  User.hasMany(Follow, { foreignKey: 'from_user_id', as: 'Following' });
  User.hasMany(LikedPost, { foreignKey: 'user_id' });
  User.hasMany(Post, { foreignKey: 'user_id' });
  User.hasMany(Comment, { foreignKey: 'user_id' });
  User.hasMany(Notification, { foreignKey: 'from_user_id', as: 'FromUser' });
  User.hasMany(Notification, { foreignKey: 'to_user_id', as: 'ToUser' });

  Follow.belongsTo(User, { foreignKey: 'to_user_id', as: 'Followers' });
  Follow.belongsTo(User, { foreignKey: 'from_user_id', as: 'Following' });
  
  LikedPost.belongsTo(User, { foreignKey: 'user_id' });
  LikedPost.belongsTo(Post, { foreignKey: 'post_id' });

  Post.belongsTo(User, { foreignKey: 'user_id' });
  Post.hasMany(LikedPost, { foreignKey: 'post_id' });
  Post.hasMany(Comment, { foreignKey: 'post_id' });

  Comment.belongsTo(Post, { foreignKey: 'post_id' });
  Comment.belongsTo(User, { foreignKey: 'user_id' });

  Notification.belongsTo(User, { foreignKey: 'from_user_id', as: 'FromUser' });
  Notification.belongsTo(User, { foreignKey: 'to_user_id', as: 'ToUser' });
};