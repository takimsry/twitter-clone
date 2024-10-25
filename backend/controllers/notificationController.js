import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { 
        to_user_id: userId
      },
      include: {
        model: User,
        as: "FromUser",
        attributes: ["id", "username", "profileImg"]
      }
    });

    const formattedNotifications = notifications.map(notification => {
      return {
        id: notification.id,
        from: {
          id: notification.FromUser.id,
          username: notification.FromUser.username,
          profileImg: notification.FromUser.profileImg
        },
        to: notification.to_user_id,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt
      }
    });

    await Notification.update(
      { read: true },
      {
        where: {
          to_user_id: userId
        }
      }
    );

    res.status(200).json(formattedNotifications);
  } catch (error) {
    console.log("Error in getNotifications controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.destroy({
      where: {
        to_user_id: userId
      }
    });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}