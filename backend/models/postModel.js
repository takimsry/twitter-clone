import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connectDB.js';
import User from './userModel.js';

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  text: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  img: {
    type: DataTypes.STRING,
    defaultValue: '',
  }
}, {
  timestamps: true
});

Post.belongsTo(User, { foreignKey: 'user_id' });

export default Post;