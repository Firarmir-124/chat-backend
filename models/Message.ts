import {model, Schema} from "mongoose";

const MessageSchema = new Schema({
  username: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  datetime: {
    type: String,
    required: true,
  }
});

const Message = model('Message', MessageSchema);

export default Message;