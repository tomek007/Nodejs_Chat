import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

export interface Message extends mongoose.Document {
  date: Date;
  message: string;
  from: string;
  to: string;
}

export interface MessageModel extends Model<Message> {
  findMessagesByUsers: (from: string, to: string) => Promise<Array<Message>>;
}

const messageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
});

messageSchema.statics.findMessagesByUsers = function (from, to) {
  const selector =
    to === 'public'
      ? {
          to,
        }
      : {
          $or: [
            { from, to },
            {
              from: to,
              to: from,
            },
          ],
        };

  return this.find(selector);
};

const Message = mongoose.model<Message, MessageModel>('Message', messageSchema);

export default Message;
