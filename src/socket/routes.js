import {store} from '../reducers';
import {ACTIONS} from '../actions/types';
import {
  decryptMessage,
  incomingMessageConverter,
  getQuickReplies,
  chat_add_new_group_participants,
  chat_group_modify_admins_helper,
  chat_leave_group_helper,
} from './helpers';

const {getState, dispatch} = store;

// SOCKET ROUTES

export const onIncomingMessage = async (data) => {
  data = decryptMessage(data);
  console.log('DATA IS : ', data);
  const message = incomingMessageConverter(data);
  const {currentMessages, user_id, quick_replies_enabled} = getState().chat;

  const payload = {message, other_user_id: data.from, isIncoming: true};
  dispatch({type: ACTIONS.CHAT_MESSAGE_HANDLER, payload});

  if (currentMessages.slice(0, 4) !== 0 && quick_replies_enabled) {
    const temp_currentMessages = [...currentMessages.slice(0, 4), ...message];
    const response = await getQuickReplies(temp_currentMessages, user_id);
    dispatch({type: ACTIONS.CHAT_QUICK_REPLIES, payload: response});
  }
};

export const onIncomingTyping = (data) => {
  dispatch({type: ACTIONS.CHAT_TYPING, payload: data});
};

export const onChatPeople = (data) => {
  dispatch({type: ACTIONS.GET_CHAT_PEOPLE, payload: data});
};

export const onOnline = (data) => {
  const {authtoken} = getState().login;
  if (data.user_id !== authtoken) {
    dispatch({type: ACTIONS.CHAT_USER_ONLINE, payload: data});
  }
};

export const onChatGroupParticipants = (response) => {
  dispatch({type: ACTIONS.CHAT_GROUP_PARTICIPANTS, payload: response});
};

export const onCreateGroup = (response) => {
  dispatch({type: ACTIONS.CHAT_GROUP_CREATE, payload: response});
};

export const onUserDisconnected = () => {
  const {authtoken} = getState().login;
  socket.emit(SOCKET_EVENTS.NOT_DISCONNECTED, {id: authtoken});
};

export const onChatPeopleSearch = (response) => {
  dispatch({
    type: ACTIONS.CHAT_PEOPLE_SEARCH,
    payload: response.chatPeopleSearch,
  });
};

export const onCommands = (commands) => {
  commands.map((command) => {
    switch (command.command) {
      case 'chat_leave_group':
        chat_leave_group_helper(command.data);
        break;

      case 'chat_group_modify_admins':
        chat_group_modify_admins_helper(command.data);
        break;

      case 'added_to_group':
        dispatch({type: ACTIONS.CHAT_ADDED_TO_GROUP, payload: command.data});
        break;

      case 'new_user_added_to_group':
        chat_add_new_group_participants(command.data);
        break;

      case 'group_change_details':
        group_change_details(command.data);
        break;

      default:
        return null;
    }
  });
};

export const onReconnect = () => {
  const {authtoken, data} = getState().login;
  socket.emit(SOCKET_EVENTS.NOT_DISCONNECTED, {
    id: authtoken,
    name: data.name,
  });
};
