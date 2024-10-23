import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connectDB.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, Infinity]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  profileImg: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false
  },
  coverImg: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
    allowNull: false
  },
  link: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false
  }
}, {
  timestamps: true
});

export default User;