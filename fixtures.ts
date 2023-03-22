import mongoose from 'mongoose';
import config from './config';
import User from "./models/User";
import * as crypto from "crypto";
import Message from "./models/Message";

const run = async () => {
  mongoose.set('strictQuery', false);
  await mongoose.connect(config.db);
  const db = mongoose.connection;


  try {
    await db.dropCollection('messages');
    await db.dropCollection('users');
  } catch (e) {
    console.log('Collections were not present, skipping drop...');
  }

  const [user1, user2] = await User.create(
    {
      username: 'dima',
      displayName: 'FarmGO',
      password: '123',
      token: crypto.randomUUID(),
      role: 'user'
    },
    {
      username: 'roma',
      displayName: 'moder',
      password: '123',
      token: crypto.randomUUID(),
      role: 'moderator'
    }
  );

   await Message.create(
    {
      text: 'Привет',
      username: user1._id,
      datetime: (new Date()).toString(),
    },
     {
       text: 'Как дела ?',
       username: user1._id,
       datetime: (new Date()).toString(),
     },
     {
       text: 'Ну привет',
       username: user2._id,
       datetime: (new Date()).toString(),
     },
     {
       text: 'Пойдет, сам как ?',
       username: user2._id,
       datetime: (new Date()).toString(),
     },
  );

  await db.close();
};

run().catch(console.error);