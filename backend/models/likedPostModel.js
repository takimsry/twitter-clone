import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connectDB.js';
import Post from './postModel.js';
import User from './userModel.js';

const LikedPost = sequelize.define('LikedPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  post_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

LikedPost.belongsTo(Post, { foreignKey: 'post_id' });
LikedPost.belongsTo(User, { foreignKey: 'user_id' });

export default LikedPost;