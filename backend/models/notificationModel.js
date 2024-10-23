import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connectDB.js';
import User from './userModel.js';

const Notification = sequelize.define('Notification', {
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
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['follow', 'like']]
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

Notification.belongsTo(User, { foreignKey: 'from_user_id' });
Notification.belongsTo(User, { foreignKey: 'to_user_id' });


export default Notification;