import { Server } from 'socket.io';
import User from './models/user';
import Message, { Message as MessageModel } from './models/message';

const activeUsers = {};

interface MessagePayload {
  with: {
    name: string;
    id: string;
  };
  messages: MessageModel[];
}

export const initSockets = async (io: Server, session): Promise<void> => {
  io.use((socket, next) => {
    session(socket.request, {}, next);
  });

  io.on(
    'connection',
    async (socket): Promise<void> => {
      // Redirection logic - we redirect unless user is available
      const { session: socketSession } = socket.request;
      if (!socketSession.passport) {
        socket.emit('redirectToLogin');
        return;
      }

      const user = await User.findOne({ _id: socketSession.passport.user });
      if (!user) {
        socket.emit('redirectToLogin');
        return;
      }

      // Join proper rooms
      socket.join(user._id); // Own room - useful for getting messages FROM OTHER USERS
      socket.join('public'); // Public - for getting messages in Public channel

      // Emit user his/hers data
      socket.emit('userData', { id: user._id, name: user.name });

      /**
       * Generic helper for sending data to all interested parties
       */
      const sendMessageData = async (
        userOrRoom: string,
        newMessage?: string
      ) => {
        // No user, no room - user did not communicate with anyone yet.
        if (!userOrRoom) {
          io.to(user._id).emit('messages', {
            with: null,
            messages: [],
          } as MessagePayload);
          return;
        }

        // Save last active room for restoring it later
        user.lastActiveRoom = userOrRoom;
        await user.save();

        // Get either public messages or specific room messages
        const messages = await Message.findMessagesByUsers(
          user._id,
          userOrRoom
        );

        // Get another room member data
        const member =
          userOrRoom !== 'public'
            ? await User.findOne({ _id: userOrRoom }).exec()
            : { _id: 'public', name: 'Public' };
        if (!member) {
          io.to(user._id).emit('messages', {
            with: null,
            messages: [],
          } as MessagePayload);
          return;
        }
        const memberData = { name: member.name, id: member._id };

        // If new message was sent and should be appended to messages - it'll get added here
        if (newMessage) {
          const messagePayload = {
            date: new Date(),
            message: newMessage,
            from: user._id,
            to: member._id,
          };
          const message = new Message(messagePayload);
          await message.save();

          const updatedMessages = [...messages, message];
          io.to(user._id).emit('messages', {
            with: memberData,
            messages: updatedMessages,
          });
          io.to(userOrRoom).emit('messages', {
            with: { name: user.name, id: user._id },
            messages: updatedMessages,
          });
          return;
        }

        io.to(user._id).emit('messages', { with: memberData, messages });
      };

      await sendMessageData(user.lastActiveRoom);

      // Notify public about new user
      activeUsers[user._id] = {
        id: user.id,
        name: user.name,
      };
      io.sockets.emit('usersList', {
        users: Object.values(activeUsers),
      });

      // Reaction to events
      socket.on('join', async (userOrRoom) => {
        await sendMessageData(userOrRoom);
      });

      socket.on('message', async (payload) => {
        await sendMessageData(payload.to, payload.message);
      });

      socket.on('disconnect', () => {
        // Notify public about leaving user
        activeUsers[user && user._id] = null;
        io.sockets.emit('usersList', {
          users: Object.values(activeUsers),
        });
      });
    }
  );
};

export default {
  initSockets,
};
