import {ACTIONS} from './types';
import {URLS, LOG_EVENT, SOCKET_EVENTS} from '../Constants';
import _ from 'lodash';
import {database} from '../database';
import {Q} from '@nozbe/watermelondb';
import {
  uploadImage,
  encrypt,
  decrypt,
  uploadImageServer,
  httpClient,
} from '../utilities';
import {socketEmit} from '../socket';

const MessagesCollection = database.collections.get('messages');

export const getChatPeople = () => {
  return (dispatch) => {
    dispatch({type: ACTIONS.CHAT_LOADING});
    httpClient()
      .get(URLS.chatpeople)
      .then((response) => {
        dispatch({type: ACTIONS.GET_CHAT_PEOPLE, payload: response.data});
      });
  };
};

export const setUserData = (data) => {
  return {type: ACTIONS.SET_CHAT_USER_DATA, payload: data};
};

const encryptMessage = (message) => {
  if (message.image && message.image.url) {
    message.image.url = encrypt(message.image.url);
  }
  if (message.text) {
    message.text = encrypt(message.text);
  }
  return {...message};
};

const sendMessageHelper = async (dispatch, message, other_user_id, image) => {
  let message_to_send = {
    text: message[0].text,
    to: other_user_id,
    image: null,
    ...message[0],
  };

  if (image) {
    dispatch({
      type: ACTIONS.CHAT_IMAGE_UPLOADING,
      payload: {imageUploading: true},
    });

    const image_url = await uploadImageServer({
      type: 'chat',
      mimeType: 'image/jpeg',
      image_url: image.url,
      extension: 'jpeg',
      shouldUpload: !image.isGif,
    });

    image.url = image_url;
    image.name = image.name;
    message_to_send = {...message_to_send, image};

    message[0].image.url = decrypt(message[0].image.url);

    dispatch({
      type: ACTIONS.CHAT_MESSAGE_HANDLER,
      payload: {message, other_user_id, isIncoming: false},
    });
    socketEmit(SOCKET_EVENTS.MESSAGE, encryptMessage(message_to_send));
  } else {
    dispatch({
      type: ACTIONS.CHAT_MESSAGE_HANDLER,
      payload: {message, other_user_id, isIncoming: false},
    });
    socketEmit(SOCKET_EVENTS.MESSAGE, encryptMessage(message_to_send));
  }
};

export const sendMessage = (message, other_user_id, image) => {
  return (dispatch) =>
    sendMessageHelper(dispatch, message, other_user_id, image);
};

export const chatPeopleSearchAction = (value) => {
  return (dispatch) => {
    if (!value) {
      dispatch({type: ACTIONS.CHAT_PEOPLE_SEARCH, payload: null});
    } else {
      dispatch({type: ACTIONS.CHAT_LOADING});
      socketEmit(SOCKET_EVENTS.CHAT_PEOPLE_SEARCH, value);
    }
  };
};

export const logEvent = (eventType, data) => {
  socketEmit(SOCKET_EVENTS.LOG_EVENT, {eventType, data});
};

export const setupComplete = () => {
  socketEmit(SOCKET_EVENTS.USER_SETUP_DONE);
  return {type: ACTIONS.CHAT_SETUP_COMPLETE};
};

export const sendTyping = (value, other_user_id) => {
  socketEmit(SOCKET_EVENTS.TYPING, {to: other_user_id, value});
  return {type: null};
};

export const getChatPeopleExplicitly = () => {
  socketEmit(SOCKET_EVENTS.CHAT_PEOPLE_EXPLICITLY);
  return {type: ACTIONS.CHAT_LOADING};
};

export const checkMessagesObject = (other_user_id, messages) => {
  if (!_.has(messages, other_user_id)) {
    messages[other_user_id] = [];
  }
  return {type: ACTIONS.CHECK_MESSAGES_OBJECT, payload: messages};
};

const messageConverter = (item) => {
  if (!!item.text) {
    text_to_save = item.text;
  } else {
    text_to_save = null;
  }
  if (!!item.image_url) {
    image_to_save = {
      url: item.image_url,
      height: item.image_height,
      width: item.image_width,
      aspectRatio: item.image_ar,
      name: item.image_name,
    };
  } else {
    image_to_save = null;
  }
  to_return = {
    _id: item.message_id,
    createdAt: item.created_at,
    user: {_id: item.user_id, name: item.user_name},

    text: text_to_save,
    image: image_to_save,
  };
  return to_return;
};

export const getCurrentUserMessages = (other_user_id, this_user_id) => {
  var t = Date.now();
  return (dispatch) => {
    MessagesCollection.query(Q.where('other_user_id', other_user_id))
      .fetch()
      .then((response) => {
        let new_response = [];
        response.map((x) => {
          item = x._raw;
          if (item.this_user_id === this_user_id) {
            // imp. check, prevents chat leak into other user's chats
            new_response.unshift(messageConverter(item, this_user_id));
          }
        });

        dispatch({type: ACTIONS.CHAT_GET_USER_MESSAGES, payload: new_response});
      });
  };
};

export const clearOtherUserData = () => {
  return {type: ACTIONS.CHAT_CLEAR_OTHER_USER};
};

export const onImageSelect = (image, imageMetaData) => {
  return {
    type: ACTIONS.CHAT_SCREEN_IMAGE_SELECT,
    payload: {selectedImage: image, imageMetaData},
  };
};

export const onComposerTextChanged = (text) => {
  return {type: ACTIONS.CHAT_COMPOSER_TEXT_CHANGED, payload: {text}};
};

export const createGroup = async (
  newGroupInfo,
  successCallback,
  errorCallback,
) => {
  if (newGroupInfo.group_image) {
    // upload image
    const aws_image = await uploadImage(newGroupInfo.group_image, {
      type: 'group_image',
      image_type: 'jpeg',
    });
    if (aws_image.error) {
      errorCallback('Could not upload image, group not created');
      return;
    }
    newGroupInfo.group_image = aws_image;
  }
  socketEmit(SOCKET_EVENTS.CREATE_GROUP, newGroupInfo);
  successCallback();
};

export const getChatGroupParticipants = (group_id) => {
  socketEmit(SOCKET_EVENTS.CHAT_GROUP_PARTICIPANTS, group_id);
  return {type: ACTIONS.CHAT_GROUP_INFO_LOADING, payload: true};
};

export const chatInfoGroupDetailsUpdateAction = (data) => {
  return {type: ACTIONS.CHAT_INFO_GROUP_DETAILS_UPDATE, payload: data};
};

export const chatInfoGroupIconUploadingAction = (value) => {
  return {type: ACTIONS.CHAT_INFO_GROUP_ICON_UPLOADING, payload: value};
};

export const modifyAdmins = async (data) => {
  // data = {group_id:String, user_id:String, add:Boolean}
  socketEmit(SOCKET_EVENTS.CHAT_GROUP_MODIFY_ADMINS, data);
};

export const leaveGroup = async (group_id, user_id) => {
  socketEmit(SOCKET_EVENTS.CHAT_LEAVE_GROUP, {
    group_id,
    user_id_to_remove: user_id,
  });
};

export const addGroupParticipants = async (group_id, user_id_list) => {
  socketEmit(SOCKET_EVENTS.CHAT_ADD_PARTICIPANTS, {group_id, user_id_list});
};

export const groupDetailsChange = async (group_id, data) => {
  socketEmit(SOCKET_EVENTS.GROUP_CHANGE_DETAILS, {group_id, ...data});
};

export const getGifs = (search) => {
  if (!search) {
    search = '';
  }
  return (dispatch) => {
    dispatch({type: ACTIONS.CHAT_GIFS_LOADING, payload: true});
    httpClient()
      .get(URLS.get_gifs, {params: {search}})
      .then(({data}) => {
        dispatch({type: ACTIONS.CHAT_GET_GIFS, payload: data});
        dispatch({type: ACTIONS.CHAT_GIFS_LOADING, payload: false});
      });
  };
};

export const gifSearch = (text) => {
  return {type: ACTIONS.CHAT_GIF_SEARCH, payload: text};
};
