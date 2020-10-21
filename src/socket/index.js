import io from 'socket.io-client';

import {BASE_URL, HTTP_TIMEOUT, SOCKET_EVENTS} from '../Constants';

export const setupSocket = () => {
  // sets the socket and listens to routes
  const socket = io.connect(BASE_URL, {
    timeout: HTTP_TIMEOUT,
    forceNew: true,
    reconnectionDelay: 500,
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on();
};

export const socketEmit = (socket_event, data) => {
  // use this function whenever we want to emit to server
  socket.emit(socket_event, data);
};
