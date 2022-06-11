import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cron from "node-cron";
import { MongoClient, ObjectId } from "mongodb";
import authMiddleware from "./middleware/authMiddleware.js";
import "dotenv/config";

const uri = process.env.MONGODB_CONNECTION_STRING;
const port = 8080;

const app = express();
const mongoClient = await MongoClient.connect(uri);
const db = mongoClient.db("notification-service");
const notifications = await db.collection("notifications");

app.use(bodyParser.json());
app.use(cors());

app.get("/ping", (req, res) => {
  res.json("pong");
});

app.get("/notification", authMiddleware, async (req, res) => {
  const receiverId = req.userId;
  const skip = req.query.skip ? +req.query.skip : 0;
  try {
    const foundNotifications = await notifications
      .find({ receiverId })
      .skip(skip)
      .limit(20)
      .toArray();
    res.json(foundNotifications);
  } catch (err) {
    console.error(err);
    res.status(400);
    res.json({ error: err.message });
  }
});

app.get("/notification/unread", authMiddleware, async (req, res) => {
  const receiverId = req.userId;
  const skip = req.query.skip ? +req.query.skip : 0;
  try {
    const foundNotifications = await notifications
      .find({ receiverId, isRead: false })
      .skip(skip)
      .limit(20)
      .toArray();
    res.json(foundNotifications);
  } catch (err) {
    console.error(err);
    res.status(400);
    res.json({ error: err.message });
  }
});

app.get("/notification/unread_count", authMiddleware, async (req, res) => {
  const receiverId = req.userId;
  try {
    const foundNotifications = await notifications.count({
      receiverId,
      isRead: false,
    });
    res.json(foundNotifications);
  } catch (err) {
    console.error(err);
    res.status(400);
    res.json({ error: err.message });
  }
});

app.post("/notification", authMiddleware, async (req, res) => {
  const notification = req.body; // { link, receiverId, payload }
  notification.isRead = false;
  notification.createdAt = new Date()
  try {
    const insertedNotification = await notifications.insertOne(notification);
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(400);
    res.json({ error: err.message });
  }
});

app.post("/notification/read", authMiddleware, async (req, res) => {
  const { notificationId } = req.body;
  try {
    const updatedNotification = await notifications.updateOne(
      { _id: ObjectId(notificationId) },
      { $set: { isRead: true } }
    );
    res.json(updatedNotification);
  } catch (err) {
    console.error(err);
    res.status(400);
    res.json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

cron.schedule("0 3 * * *", async () => {
  const deleteResults = await notifications.deleteMany({
    createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });
  console.log(deleteResults);
});

// MONGODB_CONNECTION_STRING = "mongodb://docker:mongopw@localhost:55000"