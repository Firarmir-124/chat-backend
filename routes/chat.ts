import express from "express";
import expressWs from "express-ws";
import * as crypto from "crypto";
import {WebSocket} from 'ws';
import {IncomingMessage, IUser} from "../types";
import User from "../models/User";
import Message from "../models/Message";

expressWs(express());
const chatRouter = express.Router();
const activeConnections:{[id: string]: WebSocket} = {};

chatRouter.ws('/messenger', async (ws, req, next) => {
  const id = crypto.randomUUID();
  activeConnections[id] = ws;
  let username: IUser | null = null;
  
  try {
    const user = await User.findOne({token: req.query.token}).select(['displayName', 'role']);
    const messages = await Message.find().sort({datetime: -1}).limit(30).populate('username', 'displayName');
    
    if (user) {
      username = user;
      user.isOnline = true;
      await user.save();
    }

    const newUser = await User.find({isOnline: true}).select(['displayName']);

    if (newUser) {
      Object.keys(activeConnections).forEach((id) => {
        const connection = activeConnections[id];

        connection.send(JSON.stringify({
          type: 'LOGIN',
          payload: {
            username: newUser,
            messages,
          }
        }));
      });
    }

  } catch (e) {
    return next(e);
  }
  
  ws.on('message', async (msg) => {
    const decodedMessage = JSON.parse(msg.toString()) as IncomingMessage;
    switch (decodedMessage.type) {
      case 'SEND_MESSAGES':
        if (!username) break;

        try {
          const newMessage = await Message.create({
            username,
            text: decodedMessage.payload,
            datetime: (new Date()).toString(),
          });

          Object.keys(activeConnections).forEach((id) => {
            const connection = activeConnections[id];
            connection.send(JSON.stringify({
              type: 'NEW_MESSAGE',
              payload: newMessage,
            }));
          });
        }catch (e) {
          return next(e);
        }
        break;
      case 'EXT':
        try {
          const user = await User.findOne({token: req.query.token});

          if (user) {
            user.isOnline = false;
            username = user;
            await user.save();
          }
        } catch (e) {
          return next(e);
        }
        break;
      case 'REMOVE':
        if (!username) break;
        if (username.role !== 'moderator') break;

        try {
          await Message.deleteOne({_id: decodedMessage.payload});
          const messages = await Message.find().sort({datetime: -1}).limit(30).populate('username', 'displayName');

          Object.keys(activeConnections).forEach((id) => {
            const connection = activeConnections[id];

            connection.send(JSON.stringify({
              type: 'NEW_MESSAGE_REMOVE',
              payload: {
                messages
              }
            }));
          });

        } catch (e) {
          return next(e);
        }
        break;
      default:
        console.log('Unknown type: ', decodedMessage.type);
    }
  });

  ws.on('close', async () => {
    delete activeConnections[id];
  });
});

export default chatRouter;