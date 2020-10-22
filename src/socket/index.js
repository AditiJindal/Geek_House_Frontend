import io from 'socket.io-client';

import {
  onChatGroupParticipants,
  onCreateGroup,
  onIncomingMessage,
  onIncomingTyping,
  onOnline,
  onUserDisconnected,
  onReconnect,
  onChatPeople,
  onChatPeopleSearch,
  onCommands,
} from './routes';
import {BASE_URL, HTTP_TIMEOUT, SOCKET_EVENTS} from '../Constants';

let socket = io.Socket;
let authtoken = null;

export const setupSocket = (local_authtoken) => {
  // sets the socket and listens to routes
  console.log('SETTING UP SOCKET');
  const local_socket = io.connect(BASE_URL, {
    timeout: HTTP_TIMEOUT,
    forceNew: true,
    reconnectionDelay: 500,
    transports: ['websocket'],
    autoConnect: true,
  });

  socket = local_socket;
  authtoken = local_authtoken;
};

export const runSocketListeners = () => {
  console.log('SOCKET LISTENING');

  // custom events
  socket.on(SOCKET_EVENTS.INCOMING_MESSAGE, onIncomingMessage);
  socket.on(SOCKET_EVENTS.INCOMING_TYPING, onIncomingTyping);
  socket.on(SOCKET_EVENTS.CHAT_PEOPLE, onChatPeople);
  socket.on(SOCKET_EVENTS.ONLINE, onOnline);
  socket.on(SOCKET_EVENTS.CHAT_GROUP_PARTICIPANTS, onChatGroupParticipants);
  socket.on(SOCKET_EVENTS.CREATE_GROUP, onCreateGroup);
  socket.on(SOCKET_EVENTS.USER_DISCONNECTED, onUserDisconnected);
  socket.on(SOCKET_EVENTS.COMMANDS, onCommands);
  socket.on(SOCKET_EVENTS.CHAT_PEOPLE_SEARCH, onChatPeopleSearch);

  // in built events
  socket.on(SOCKET_EVENTS.connect, socketConnect);
  socket.on(SOCKET_EVENTS.disconnect, socketDisconnect);
  socket.on(SOCKET_EVENTS.reconnect, onReconnect);
};

export const socketEmit = (socket_event, data) => {
  // use this function whenever we want to emit to server
  console.log(`SOCKET EVENT :  ${socket_event} AUTHTOKEN : ${authtoken}`);
  socket.emit(socket_event, {data, authtoken});
};

export const socketConnect = () => {
  console.log(`SOCKET CONNECTED :  ${socket.connected}`);
};

export const socketDisconnect = () => {
  console.log(`SOCKET DISCONNECTED :  ${socket.disconnected}`);
  socket.disconnect(true);
};
