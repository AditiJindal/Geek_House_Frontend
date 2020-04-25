import {ACTIONS} from '../actions/types';
import AsyncStorage from '@react-native-community/async-storage';
import {COLORS_LIGHT_THEME, COLORS_DARK_THEME, LOG_EVENT} from '../Constants';
import analytics from '@react-native-firebase/analytics';
import _ from 'lodash';
import {logEvent} from '../actions/ChatAction';
import perf from '@react-native-firebase/perf';
import {database} from '../database';
import uuid from 'uuid';
import {decrypt} from '../encryptionUtil';

const MessagesCollection = database.collections.get('messages');
const traceDB = perf().newTrace('mobile_db_time_save');
const trace = perf().newTrace('save_data_async_storage');

const INITIAL_CHAT_SCREEN_STATE = {
  selectedImage: null,
  imageMetaData: {name: '', oldSize: null, newSize: null},
  imageUploading: false,
  text: '',
};

const INITIAL_STATE = {
  socket: null,
  loading: true,
  chats: [],
  messages: {}, // {"user_id": [ {_id:Number, text:String, created_at: Date, user: {_id:String}} ,{}, {} ]}
  other_user_data: {},
  status: {}, // {"user_id":{online: true, typing: false, unread_messages: 2, recentMessage:"", recentActivity: Date}}
  total_typing: 0,
  total_unread_messages: 0,
  chatScreenOpen: false,
  loaded_from_storage: false,
  first_login: false,
  user_id: '',
  theme: 'light',
  animationOn: true,
  quick_replies_enabled: true,
  chat_background: {image: null, blur: 2},
  chatPeopleSearchLoading: false,
  authTokenSet: false,
  chatPeopleSearch: null,
  COLORS: COLORS_LIGHT_THEME,
  chatScreenState: INITIAL_CHAT_SCREEN_STATE,
  quick_replies: [],
  currentMessages: [], // list of messages of currently loaded person
  chat_group_participants: {},
  chatInfoLoading: false,
  chatGroupsLeft: [],

  chatInfoGroupDetails: {groupName: '', groupImage: ''},
  chatInfoGroupIconUploading: false,

  gifs: {search: '', data: null},
  gifs_loading: false,
};

const incomingMessageConverter = item => {
  new_message = [
    {
      _id: uuid(),
      createdAt: item.createdAt,
      text: item.text,
      user: {_id: item.from, name: item.groupSender},
      image: item.image,
    },
  ];
  return new_message;
};

const decryptMessage = message => {
  if (message.image) {
    message.image.url = decrypt(message.image.url);
  }
  if (message.text) {
    message.text = decrypt(message.text);
  }
  return message;
};

const insertUnreadMessages = (
  unread_messages,
  this_user_id,
  status,
  total_unread_messages,
  chats,
) => {
  let new_chats = [...chats];
  unread_messages.map(item => {
    item = decryptMessage(item);

    status[item.from].unread_messages += 1;
    status[item.from].recentMessage = item.text ? item.text : 'Sent a photo 📷';
    status[item.from].recentActivity = item.createdAt;
    total_unread_messages += 1;

    new_chats = reorderChatsList(new_chats, item.from);

    saveMessageInDB(
      {
        message: incomingMessageConverter(item),
        other_user_id: item.from,
        isIncomming: true,
      },
      this_user_id,
    );
  });

  return {status, total_unread_messages, new_chats};
};

const reorderChatsList = (list, elem) => {
  new_list = [];
  list.map(item => {
    if (item._id === elem) {
      new_list.unshift(item);
    } else {
      new_list.push(item);
    }
  });

  return new_list;
};

const saveMessageInDB = (payload, this_user_id) => {
  const {message, other_user_id} = payload;
  let text_to_save = null;
  let image_to_save = {
    url: null,
    height: null,
    width: null,
    aspectRatio: null,
    name: null,
  };
  if (message[0].text) {
    text_to_save = message[0].text;
  }
  if (!!message[0].image) {
    image_to_save = message[0].image;
  }
  // saving message to database
  traceDB.start();
  var t = Date.now();
  database
    .action(async () => {
      MessagesCollection.create(new_message => {
        (new_message.other_user_id = other_user_id.toString()),
          (new_message.message_id = message[0]._id),
          (new_message.created_at = Date.parse(message[0].createdAt)),
          (new_message.user_id = message[0].user._id),
          (new_message.user_name = message[0].user.name),
          (new_message.this_user_id = this_user_id);

        (new_message.text = text_to_save),
          (new_message.image_url = image_to_save.url),
          (new_message.image_height = image_to_save.height),
          (new_message.image_width = image_to_save.width),
          (new_message.image_ar = image_to_save.aspectRatio),
          (new_message.image_name = image_to_save.name);
      });
    })
    .then(() => {
      traceDB.stop();
      traceDB.putMetric('mobile_db_time_save', Date.now() - t);
    });
};

const saveData = async (state, recordPerf = false) => {
  let to_save = {
    status: state.status,
    total_unread_messages: state.total_unread_messages,
    theme: state.theme,
    animationOn: state.animationOn,
    quick_replies_enabled: state.quick_replies_enabled,
    first_login: state.first_login,
    chat_background: state.chat_background,
    chats: state.chats,
    // chat_group_participants: state.chat_group_participants
  };

  if (recordPerf) {
    t = Date.now();
    trace.start();
  }
  to_save = JSON.stringify(to_save);
  await AsyncStorage.setItem(state.user_id.toString(), to_save);
  if (recordPerf) {
    trace.stop();
    trace.putMetric('save_data_time', Date.now() - t);
  }
};

const mergeChats = (new_chats, old_chats) => {
  let final_result = [];

  let old_chat_ids = [];

  old_chats.map(chat => {
    final_result.push(chat);
    old_chat_ids.push(chat._id);
  });

  new_chats.map(chat => {
    if (!old_chat_ids.includes(chat._id)) {
      final_result.unshift(chat);
    }
  });

  return final_result;
};

export default (state = INITIAL_STATE, action) => {
  let new_users, new_admins, other_user_data, all_users;
  let new_state, recentMessage, group, new_chatGroupsLeft;

  switch (action.type) {
    case ACTIONS.LOGOUT:
      if (action.payload) {
        state.socket.disconnect(true);
      }
      return {...INITIAL_STATE};

    case ACTIONS.SET_SOCKET:
      return {...state, socket: action.payload};

    case ACTIONS.CHAT_LOAD_DATA:
      user_id = action.payload.user_id;
      COLORS = COLORS_DARK_THEME;

      if (Object.keys(action.payload).length !== 1) {
        new_messages = {...action.payload.messages};
        total_unread_messages = action.payload.total_unread_messages;
        new_status = {...action.payload.status};
        new_chats = [...action.payload.chats];

        if (!action.payload.theme) {
          action.payload.theme = INITIAL_STATE.theme;
          COLORS = COLORS_LIGHT_THEME;
        } else {
          if (action.payload.theme === 'light') {
            COLORS = COLORS_LIGHT_THEME;
          }
        }
        analytics().setUserProperties({
          Theme: action.payload.theme,
        });

        if (total_unread_messages < 0) {
          total_unread_messages = 0;
        }
        new_state = {
          ...state,
          theme: action.payload.theme,
          animationOn: action.payload.animationOn,
          quick_replies_enabled: action.payload.quick_replies_enabled,
          chat_background: action.payload.chat_background,
          // chat_group_participants: action.payload.chat_group_participants,
          user_id,
          messages: new_messages,
          COLORS,
          total_unread_messages,
          status: new_status,
          loaded_from_storage: true,
          chats: new_chats,
        };

        saveData(new_state);
        return new_state;
      } else {
        return {...state, user_id};
      }

    case ACTIONS.CHECK_MESSAGES_OBJECT:
      return {...state, messages: action.payload};

    case ACTIONS.CHANGE_THEME:
      COLORS = COLORS_DARK_THEME;
      if (action.payload === 'light') {
        COLORS = COLORS_LIGHT_THEME;
      }
      new_state = {...state, theme: action.payload, COLORS};

      saveData(new_state);
      return new_state;

    case ACTIONS.GOT_CHAT_MESSAGE:
      return {...state};

    case ACTIONS.CHAT_AUTH_TOKEN_SET:
      return {...state, authTokenSet: true};

    case ACTIONS.CHAT_TYPING:
      new_status = {...state.status};
      if (action.payload.value) {
        new_total_typing = state.total_typing + 1;
      } else {
        new_total_typing = state.total_typing - 1;
        if (new_total_typing < 0) {
          new_total_typing = 0;
        }
      }
      new_status[action.payload.from].typing = action.payload.value;
      if (action.payload.value) {
        new_status[action.payload.from].online = true;
      }

      return {...state, status: new_status, total_typing: new_total_typing};

    case ACTIONS.CHAT_USER_ONLINE:
      new_status = {...state.status};
      if (!new_status[action.payload.user_id]) {
        new_status[action.payload.user_id] = {
          online: false,
          typing: false,
          unread_messages: 0,
        };
      }
      new_status[action.payload.user_id].online = action.payload.value;
      new_status[action.payload.user_id].typing = false;
      return {...state, status: new_status};

    case ACTIONS.CHAT_LOADING:
      return {...state, loading: true};

    case ACTIONS.SET_CHAT_USER_DATA:
      other_user_data = action.payload;
      new_status = {...state.status};

      if (state.status.hasOwnProperty(action.payload._id)) {
        // means if the user is already present/ we know the user
        total_unread_messages =
          state.total_unread_messages -
          state.status[action.payload._id].unread_messages;
        state.status[action.payload._id].unread_messages = 0;
        other_user_data = {...other_user_data, newEntry: false};
      } else {
        // if we don't know the user beforehand, don't add it in status for now
        // we assume the person is just looking at the user
        total_unread_messages = state.total_unread_messages;
        other_user_data = {...other_user_data, newEntry: false};
      }

      if (total_unread_messages < 0) {
        total_unread_messages = 0;
      }
      new_state = {
        ...state,
        status: state.status,
        other_user_data,
        total_unread_messages,
        chatScreenOpen: true,
      };

      saveData(new_state);
      return new_state;

    case ACTIONS.GET_CHAT_PEOPLE:
      // needs to return chats, chatPeople, status and messages
      // status: {'<other_user_id>': {online:bool, typing:bool, unread_messages:Array}}
      // messages: {'<other_user_id>': [message_objects]}

      // const all_users = [...action.payload.chats]
      all_users = mergeChats(action.payload.chats, [...state.chats]);
      new_messages = {...state.messages};
      duplicate_status = {...state.status};
      total_unread_messages = state.total_unread_messages;

      if (state.loaded_from_storage && Object.keys(state.status).length !== 0) {
        status = {...state.status};
        all_users.map(item => {
          if (!status.hasOwnProperty(item._id)) {
            status[item._id] = {
              online: false,
              typing: false,
              unread_messages: 0,
            };
          }
          action.payload.allOnline.includes(item._id)
            ? (online = true)
            : (online = false);
          status[item._id] = {
            online,
            typing: false,
            unread_messages: status[item._id].unread_messages,
            recentMessage: status[item._id].recentMessage,
            recentActivity: status[item._id].recentActivity,
          };
        });
      } else {
        status = {};
        all_users.map(item => {
          action.payload.allOnline.includes(item._id)
            ? (online = true)
            : (online = false);
          status[item._id] = {
            online,
            typing: false,
            unread_messages: 0,
            recentMessage: '',
            recentActivity: Date.now(),
          };
        });
      }

      let {status, total_unread_messages, new_chats} = insertUnreadMessages(
        action.payload.unread_messages,
        state.user_id,
        status,
        total_unread_messages,
        all_users,
      );

      if (total_unread_messages < 0) {
        total_unread_messages = 0;
      }
      if (action.payload.explicitly) {
        status = duplicate_status;
      }

      new_state = {
        ...state,
        chats: new_chats,
        chatGroupsLeft: action.payload.chatGroupsLeft,
        loading: false,
        status,
        total_unread_messages,
      };

      // delete action.payload.chats

      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_MESSAGE_HANDLER:
      // new_messages = {...state.messages};
      new_status = {...state.status};
      total_unread_messages = state.total_unread_messages;
      new_currentMessages = [];
      payload_message = action.payload.message;
      recentMessage = payload_message[0].text;
      isGif = payload_message[0].image ? payload_message[0].image.isGif : false;

      // action.payload.message is [ { ... } ], is an array containing one object
      state.chats = reorderChatsList(state.chats, action.payload.other_user_id);

      if (isGif) {
        recentMessage = 'Sent a GIF 🌈';
      }

      if (!recentMessage) {
        recentMessage = 'Sent a photo 📷';
      }

      if (action.payload.isIncomming) {
        analytics().logEvent('received_message');
      } else {
        analytics().logEvent('sent_message');
        recentMessage = 'You : ' + recentMessage;
      }

      saveMessageInDB(action.payload, state.user_id);

      new_currentMessages = state.currentMessages;
      if (
        state.other_user_data._id &&
        state.other_user_data._id.toString() ===
          action.payload.other_user_id.toString()
      ) {
        // means the user has opened a chat which is diffenenr and the message he received is
        // from the same user
        new_currentMessages = [...payload_message, ...state.currentMessages];
      }

      if (!state.status.hasOwnProperty(action.payload.other_user_id)) {
        new_messages[action.payload.other_user_id] = payload_message;
        new_status[action.payload.other_user_id] = {
          online: action.payload.isIncomming,
          typing: false,
          unread_messages: 0,
          recentMessage,
          recentActivity: payload_message[0].createdAt,
        };

        state.socket.emit('chat_people_explicitly');
      } else {
        new_status[action.payload.other_user_id].recentActivity =
          payload_message[0].createdAt;
        new_status[action.payload.other_user_id].recentMessage = recentMessage;
      }

      if (
        action.payload.other_user_id !== state.other_user_data._id ||
        !state.chatScreenOpen
      ) {
        if (new_status.hasOwnProperty(action.payload.other_user_id)) {
          new_status[action.payload.other_user_id].unread_messages += 1;
          total_unread_messages += 1;
        }
      }

      if (total_unread_messages < 0) {
        total_unread_messages = 0;
      }

      new_state = {
        ...state,
        loading: false,
        currentMessages: new_currentMessages,
        chats: [...state.chats],
        status: new_status,
        total_unread_messages,
        quick_replies: [],
        chatScreenState: INITIAL_CHAT_SCREEN_STATE,
      };

      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_CLEAR_OTHER_USER:
      new_status = {...state.status};
      new_status[state.other_user_data._id].unread_messages = 0;
      return {
        ...state,
        chatScreenOpen: false,
        currentMessages: [],
        quick_replies: [],
        status: new_status,
        chatScreenState: INITIAL_CHAT_SCREEN_STATE,
      };

    case ACTIONS.CHAT_SAVE_DATA:
      saveData(state, true);
      return state;

    case ACTIONS.SETTINGS_CHANGE_ANIMATION:
      new_state = {...state, animationOn: !state.animationOn};
      saveData(new_state);
      return new_state;

    case ACTIONS.SETTINGS_CHANGE_QUICK_REPLIES:
      new_state = {
        ...state,
        quick_replies_enabled: !state.quick_replies_enabled,
      };
      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_PEOPLE_SEARCH:
      return {...state, chatPeopleSearch: action.payload, loading: false};

    case ACTIONS.CHAT_SOCKET_CHANGE_CATEGORY:
      state.socket.emit('change_favourite_category', action.payload);
      return state;

    case ACTIONS.CHAT_SETUP_COMPLETE:
      state.socket.emit('user_setup_done');
      new_state = {...state, first_login: false};
      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_FIRST_LOGIN:
      COLORS = COLORS_DARK_THEME;
      if (action.payload.theme === 'light') {
        COLORS = COLORS_LIGHT_THEME;
      }
      new_state = {
        ...state,
        first_login: action.payload.first_login,
        COLORS,
        user_id: action.payload.authtoken,
        theme: action.payload.theme,
      };
      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_GET_USER_MESSAGES:
      currentMessages = action.payload;
      return {...state, currentMessages};

    case ACTIONS.CHANGE_CHAT_BACKGROUND:
      new_state = {
        ...state,
        chat_background: {...state.chat_background, image: action.payload},
      };
      saveData(new_state);
      return new_state;

    case ACTIONS.CHANGE_CHAT_BACKGROUND_BLUR:
      new_state = {
        ...state,
        chat_background: {...state.chat_background, blur: action.payload},
      };
      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_QUICK_REPLIES:
      new_state = {...state, quick_replies: action.payload};
      return new_state;

    case ACTIONS.CHAT_SCREEN_IMAGE_SELECT:
      new_state = {
        ...state,
        chatScreenState: {...state.chatScreenState, ...action.payload},
      };
      return new_state;

    case ACTIONS.CHAT_IMAGE_UPLOADING:
      new_state = {
        ...state,
        chatScreenState: {...state.chatScreenState, ...action.payload},
      };
      return new_state;

    case ACTIONS.CHAT_COMPOSER_TEXT_CHANGED:
      new_state = {
        ...state,
        chatScreenState: {...state.chatScreenState, ...action.payload},
      };
      return new_state;

    case ACTIONS.CHAT_GROUP_PARTICIPANTS:
      for (i = 0; i < action.payload.users.length; i++) {
        user = action.payload.users[i];
        if (action.payload.admins.includes(user._id)) {
          user.isAdmin = true;
        } else {
          user.isAdmin = false;
        }
      }

      new_chat_group_participants = {...state.chat_group_participants};
      new_chat_group_participants[action.payload.group_id] = action.payload;

      new_state = {
        ...state,
        chat_group_participants: new_chat_group_participants,
        chatInfoLoading: false,
      };
      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_GROUP_INFO_LOADING:
      return {...state, chatInfoLoading: action.payload};

    case ACTIONS.CHAT_GROUP_CREATE:
      new_state = {...state, chats: [action.payload, ...state.chats]};
      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_ADDED_TO_GROUP:
      group = action.payload;
      if (state.chatGroupsLeft.includes(group._id)) {
        // means user was earlier in this group, is now being re-added
        new_chatGroupsLeft = [];
        state.chatGroupsLeft.map(item => {
          if (item !== group._id) {
            new_chatGroupsLeft.push(item);
          }
        });

        new_state = {
          ...state,
          chatGroupsLeft: new_chatGroupsLeft,
          chats: [...state.chats],
        };
      } else {
        new_state = {...state, chats: [group, ...state.chats]};
      }

      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_LEAVE_GROUP:
      // const {group_id, user_id, specialMessage} = action.payload
      if (state.user_id === action.payload.user_id) {
        state.chatGroupsLeft.push(action.payload.group_id);
      }

      // remove user_id from users and admins in chat_group_participants
      new_users = [];
      if (state.chat_group_participants[action.payload.group_id]) {
        state.chat_group_participants[action.payload.group_id].users.map(
          item => {
            if (item._id !== action.payload.user_id) {
              new_users.push(item);
            }
          },
        );
        state.chat_group_participants[
          action.payload.group_id
        ].users = new_users;

        new_admins = [];
        state.chat_group_participants[action.payload.group_id].admins.map(
          item => {
            if (item._id !== action.payload.user_id) {
              new_admins.push(item);
            }
          },
        );
        state.chat_group_participants[
          action.payload.group_id
        ].admins = new_admins;
      }

      new_state = {
        ...state,
        chatGroupsLeft: [...state.chatGroupsLeft],
        chat_group_participants: {...state.chat_group_participants},
      };
      saveData(new_state);
      return new_state;

    case ACTIONS.CHAT_GROUP_MODIFY_ADMINS:
      new_users = state.chat_group_participants[
        action.payload.group_id
      ].users.map(user => {
        if (action.payload.admins.includes(user._id)) {
          user.isAdmin = true;
        } else {
          user.isAdmin = false;
        }
        return user;
      });

      state.chat_group_participants[action.payload.group_id].users = new_users;
      state.chat_group_participants[action.payload.group_id].admins =
        action.payload.admins;

      return {
        ...state,
        chat_group_participants: {...state.chat_group_participants},
      };

    case ACTIONS.CHAT_ADD_NEW_GROUP_PARTICIPANTS:
      const {new_group_participants} = action.payload;
      state.chat_group_participants[action.payload.group_id].users = [
        ...state.chat_group_participants[action.payload.group_id].users,
        ...new_group_participants,
      ];
      new_state = {
        ...state,
        chat_group_participants: {...state.chat_group_participants},
      };
      return new_state;

    case ACTIONS.CHAT_INFO_GROUP_ICON_UPLOADING:
      return {...state, chatInfoGroupIconUploading: action.payload};

    case ACTIONS.CHAT_INFO_GROUP_DETAILS_UPDATE:
      return {...state, chatInfoGroupDetails: action.payload};

    case ACTIONS.CHAT_GROUP_CHANGE_DETAILS:
      const {groupName, groupImage} = action.payload;

      let new_chatInfoGroupDetails = state.chatInfoGroupDetails;
      if (state.other_user_data._id === action.payload.group_id) {
        // means user has this group currently open
        state.other_user_data.name = groupName;
        state.other_user_data.image_url = groupImage;
        new_chatInfoGroupDetails = action.payload;
      }

      state.chats.map((chat, index) => {
        if (chat._id === action.payload.group_id) {
          state.chats[index] = {
            ...chat,
            name: groupName,
            image_url: groupImage,
          };
        }
      });

      new_state = {
        ...state,
        chats: [...state.chats],
        other_user_data: {...state.other_user_data},
        chatInfoGroupDetails: new_chatInfoGroupDetails,
      };
      return new_state;

    case ACTIONS.CHAT_GIFS_LOADING:
      new_state = {...state, gifs_loading: action.payload};
      return new_state;

    case ACTIONS.CHAT_GET_GIFS:
      new_state = {...state, gifs: {...state.gifs, data: action.payload}};
      return new_state;

    case ACTIONS.CHAT_GIF_SEARCH:
      new_state = {...state, gifs: {...state.gifs, search: action.payload}};
      return new_state;

    default:
      return state;
  }
};
