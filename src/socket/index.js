import io from 'socket.io-client';

import {store} from '../reducers';
import {
  onChatGroupParticipants,
  onCreateGroup,
  onIncomingMessage,
  onIncomingTyping,
  onOnline,
  onChatPeople,
  onChatPeopleSearch,
  onCommands,
} from './routes';
import {BASE_URL, HTTP_TIMEOUT, SOCKET_EVENTS} from '../Constants';

let socket = io.Socket;
let authtoken = null;
const {getState} = store;

// 2 layered function
const socketOnEventLogger = (socket) => {
  Object.keys(SOCKET_EVENTS).map((socket_event) => {
    socket.addEventListener(socket_event, (data) => {
      console.log(`SOCKET ON :  ${socket_event} DATA : `, data);
    });
  });
};

const onSocketConnect = () => {
  if (__DEV__) {
    console.log(
      `SOCKET CONNECTED : ${socket.connected} SOCKET_ID : ${socket.id}`,
    );
  }
};

const onSocketDisconnect = () => {
  const {authtoken, data} = getState().login;
  socket.emit(SOCKET_EVENTS.NOT_DISCONNECTED, {
    id: authtoken,
    name: data.name,
  });
};

const onSocketReconnect = () => {
  const {authtoken, data} = getState().login;
  socket.emit(SOCKET_EVENTS.NOT_DISCONNECTED, {
    id: authtoken,
    name: data.name,
  });
};

export const setupSocket = (local_authtoken) => {
  // sets the socket and listens to routes
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
  if (__DEV__) {
    console.log('SOCKET LISTENING');
    socketOnEventLogger(socket);
  }

  // custom events
  socket.on(SOCKET_EVENTS.INCOMING_MESSAGE, onIncomingMessage);
  socket.on(SOCKET_EVENTS.INCOMING_TYPING, onIncomingTyping);
  socket.on(SOCKET_EVENTS.CHAT_PEOPLE, onChatPeople);
  socket.on(SOCKET_EVENTS.ONLINE, onOnline);
  socket.on(SOCKET_EVENTS.CHAT_GROUP_PARTICIPANTS, onChatGroupParticipants);
  socket.on(SOCKET_EVENTS.CREATE_GROUP, onCreateGroup);
  socket.on(SOCKET_EVENTS.COMMANDS, onCommands);
  socket.on(SOCKET_EVENTS.CHAT_PEOPLE_SEARCH, onChatPeopleSearch);

  // in built events
  socket.on(SOCKET_EVENTS.connect, onSocketConnect);
  socket.on(SOCKET_EVENTS.reconnect, onSocketReconnect);
  socket.on(SOCKET_EVENTS.disconnect, onSocketDisconnect);
};

export const socketEmit = (socket_event, data) => {
  // use this function whenever we want to emit to server
  console.log(
    `SOCKET EVENT :  ${socket_event} AUTHTOKEN : ${authtoken}  DATA : `,
    data,
  );
  socket.emit(socket_event, {data, authtoken});
};

export const disconnectSocket = () => {
  if (__DEV__) {
    console.log(`SOCKET DISCONNECTED :  ${socket.disconnected}`);
  }
  socket.disconnect(true);
};
