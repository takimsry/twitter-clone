import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connectDB.js';
import User from './userModel.js';

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  from_user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  to_user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

Follow.belongsTo(User, { foreignKey: 'from_user_id' });
Follow.belongsTo(User, { foreignKey: 'to_user_id' });

export default Follow;