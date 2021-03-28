import io from 'socket.io-client';

import chatListTpl from './views/chat-list.handlebars';
import loginTpl from './views/login.handlebars';
import mainTpl from './views/main.handlebars';
import messageViewTpl from './views/message-view.handlebars';

document.getElementById('app-root').innerHTML = mainTpl();

const socket = io();

const dataModel = {
  currentRoom: null,
  me: null,
  messages: null,
  with: null,
  users: null,
};

/**
 * Prepares messages that will be displayed in message window
 */
const transformMessages = (messages, withWho, me, users) => {
  return (
    messages &&
    messages.map((message) => {
      const date = new Date(message.date);

      let name;
      const isFromMe = me && me.id === message.from;
      if (isFromMe) {
        name = '(You)';
      } else {
        const memberData =
          users && users.find((user) => user && user.id === message.from);
        name = `(${(memberData && memberData.name) || withWho.name})`;
      }

      return `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]${name}: ${
        message.message
      }`;
    })
  );
};

/**
 * Updates all the views at once. Keeps UI in sync with data model
 */
const updateViews = () => {
  // Update messages
  const messagesListContainer = document.getElementById('message-window');
  if (messagesListContainer) {
    messagesListContainer.innerHTML = messageViewTpl({
      with: dataModel.with,
      messages: transformMessages(
        dataModel.messages,
        dataModel.with,
        dataModel.me,
        dataModel.users
      ),
    });
  }

  // Update users list
  const usersContainer = document.getElementById('users-list');
  if (usersContainer) {
    usersContainer.innerHTML = chatListTpl(dataModel.users);
  }
};

socket.on('messages', (data) => {
  dataModel.with = data.with;
  dataModel.messages = data.messages;
  updateViews();
});

socket.on('redirectToLogin', () => {
  document.getElementById('app-root').innerHTML = loginTpl();
});

socket.on('userData', (data) => {
  dataModel.me = data;
  updateViews();
});

socket.on('usersList', (data) => {
  dataModel.users = data.users;
  updateViews();
});

window.join = (roomOrUserId) => {
  dataModel.currentRoom = roomOrUserId;
  socket.emit('join', roomOrUserId);
};

window.sendMessage = () => {
  const messageField = document.getElementById('message');
  socket.emit('message', {
    to: dataModel.with && dataModel.with.id,
    message: messageField.value,
  });
  messageField.value = '';

  return false;
};
