import {store} from '../reducers';
import {ACTIONS} from '../actions/types';
import {
  decryptMessage,
  incomingMessageConverter,
  getQuickReplies,
  chat_add_new_group_participants,
  chat_group_modify_admins_helper,
  chat_leave_group_helper,
  group_change_details,
} from './helpers';
import {SOCKET_EVENTS} from '../Constants';

const {getState, dispatch} = store;

// SOCKET ROUTES

export const onIncomingMessage = async (data) => {
  data = decryptMessage(data);
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

export const onChatPeopleSearch = (response) => {
  dispatch({
    type: ACTIONS.CHAT_PEOPLE_SEARCH,
    payload: response.chatPeopleSearch,
  });
};

export const onCommands = (commands) => {
  console.log('COMMANDS HERE : ', commands);
  commands.map((command) => {
    switch (command.command) {
      case SOCKET_EVENTS.CHAT_LEAVE_GROUP:
        chat_leave_group_helper(command.data);
        break;

      case SOCKET_EVENTS.CHAT_GROUP_MODIFY_ADMINS:
        chat_group_modify_admins_helper(command.data);
        break;

      case SOCKET_EVENTS.CHAT_USER_ADDED_TO_GROUP:
        dispatch({type: ACTIONS.CHAT_ADDED_TO_GROUP, payload: command.data});
        break;

      case SOCKET_EVENTS.CHAT_NEW_USER_ADDED_TO_GROUP:
        chat_add_new_group_participants(command.data);
        break;

      case SOCKET_EVENTS.GROUP_CHANGE_DETAILS:
        group_change_details(command.data);
        break;

      default:
        return null;
    }
  });
};
