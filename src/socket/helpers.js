import uuid from 'uuid-random';
import naturalLanguage from '@react-native-firebase/ml-natural-language';

import {store} from '../reducers';
import {ACTIONS} from '../actions/types';
import {decrypt} from '../utilities';

const {dispatch} = store;

export const decryptMessage = (message) => {
  if (message.image && message.image.url) {
    message.image.url = decrypt(message.image.url);
  }
  if (message.text) {
    message.text = decrypt(message.text);
  }
  return message;
};

export const incomingMessageConverter = (data) => {
  const new_message = [
    {
      _id: uuid(),
      createdAt: data.createdAt,
      text: data.text,
      user: {_id: data.from, name: data.groupSender},
      image: data.image,
    },
  ];

  return new_message;
};

export const getQuickReplies = async (recent_messages, local_user_id) => {
  const feedList = [];
  recent_messages.reverse().map((item) => {
    if (!(item.text && item.createdAt && item.user._id)) {
      return;
    }

    let obj = {text: item.text, timestamp: Date.parse(Date(item.createdAt))};
    if (item.user._id === local_user_id) {
      obj.isLocalUser = true;
    } else {
      obj.userId = item.user._id;
      obj.isLocalUser = false;
    }
    feedList.push(obj);
    return;
  });

  const response = await naturalLanguage().suggestReplies(feedList);
  return response;
};

export const chat_leave_group_helper = (response) => {
  message = [
    {
      _id: uuid(),
      createdAt: Date.now(),
      text: MESSAGE_SPECIAL_ADDER + response.specialMessage,
      user: {_id: response.group_id, name: ''},
    },
  ];
  special_message = {
    message,
    other_user_id: response.group_id,
    isIncoming: true,
  };
  dispatch({type: ACTIONS.CHAT_LEAVE_GROUP, payload: response});
  dispatch({type: ACTIONS.CHAT_MESSAGE_HANDLER, payload: special_message});
};

export const chat_group_modify_admins_helper = (response) => {
  message = [
    {
      _id: uuid(),
      createdAt: Date.now(),
      text: MESSAGE_SPECIAL_ADDER + response.specialMessage,
      user: {_id: response.group_id, name: ''},
    },
  ];
  special_message = {
    message,
    other_user_id: response.group_id,
    isIncoming: true,
  };
  dispatch({type: ACTIONS.CHAT_GROUP_MODIFY_ADMINS, payload: response});
  dispatch({type: ACTIONS.CHAT_MESSAGE_HANDLER, payload: special_message});
};

export const chat_add_new_group_participants = (response) => {
  message = [
    {
      _id: uuid(),
      createdAt: Date.now(),
      text: MESSAGE_SPECIAL_ADDER + response.specialMessage,
      user: {_id: response.group_id, name: ''},
    },
  ];
  dispatch({type: ACTIONS.CHAT_ADD_NEW_GROUP_PARTICIPANTS, payload: response});

  special_message = {
    message,
    other_user_id: response.group_id,
    isIncoming: true,
  };
  dispatch({type: ACTIONS.CHAT_MESSAGE_HANDLER, payload: special_message});
};

export const group_change_details = (response) => {
  message = [
    {
      _id: uuid(),
      createdAt: Date.now(),
      text: MESSAGE_SPECIAL_ADDER + response.specialMessage,
      user: {_id: response.group_id, name: ''},
    },
  ];
  dispatch({type: ACTIONS.CHAT_GROUP_CHANGE_DETAILS, payload: response});
  dispatch({type: ACTIONS.CHAT_INFO_GROUP_ICON_UPLOADING, payload: false});

  special_message = {
    message,
    other_user_id: response.group_id,
    isIncoming: true,
  };
  dispatch({type: ACTIONS.CHAT_MESSAGE_HANDLER, payload: special_message});
};
