import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connectDB.js';

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

export default LikedPost;