import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoute from './routes/authRoute.js';
import postRoute from './routes/postRoute.js';
import userRoute from './routes/userRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import {v2 as cloudinary} from 'cloudinary';
import { connectDB, sequelize } from './db/connectDB.js';
import { initModels } from './lib/utils/initModels.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/notifications", notificationRoute);

const startServer = async () => {
  await connectDB();
  initModels();
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}/`);    
  })
}

startServer();