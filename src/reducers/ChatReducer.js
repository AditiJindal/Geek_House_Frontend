import {ACTIONS} from '../actions/types';
import uuid from 'uuid/v4';
import AsyncStorage from '@react-native-community/async-storage';
import {COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import analytics from '@react-native-firebase/analytics';
import perf from '@react-native-firebase/perf';
// import VasernDB from '../database';
import {database} from '../database';
import { Q } from '@nozbe/watermelondb';
const MessagesCollection =  database.collections.get('messages');

// {
//   _id: 1,
//   text: 'Hello developer',
//   createdAt: new Date(),
//   user: {
//     _id: 2,
//     name: 'React Native',
//     avatar: 'https://placeimg.com/140/140/any',
//   },
// },


const INITIAL_STATE={
  socket: null,
  loading:true,
  chatPeople:{},
  chats: [],
  messages: {}, // {"user_id": [ {_id:Number, text:String, createdAt: Date, user: {_id:String}} ,{}, {} ]}
  other_user_data: {},
  status: {}, // {"user_id":{online: true, typing: false, unread_messages: 2}}
  total_typing: 0,
  total_unread_messages: 0,
  chatScreenOpen: false,
  loaded_from_storage: false,
  first_login:false,
  user_id: "",
  theme: "light",
  animationOn:true,
  chatPeopleSearchLoading:false,
  authTokenSet: false,
  chatPeopleSearch:null,
  COLORS: COLORS_LIGHT_THEME,
  currentMessages:[] // list of messages of currently loaded person
}

const trace = perf().newTrace("save_data_async_storage")

// const incomingMessageConverter = (data) => {
//   new_message = [
//     {_id:uuid(), createdAt: data.createdAt, text:data.text,image:data.image, user:{_id:data.from}}
//   ]
//   return new_message
// }

const saveMessageInDB = (payload, state_user_id) => {
  const {message, other_user_id} = payload
  let text_to_save=null
  let image_to_save={};
  if (message[0].text){
    text_to_save=message[0].text
  }
  if (!!message[0].image){
    image_to_save=message[0].image
  }

  // saving message to database
  database.action(async () => {
    console.log("Date.parse here is: ", Date.parse(message[0].createdAt))
    res = await MessagesCollection.create(new_message => {
      new_message.other_user_id = other_user_id,
      new_message.message_id = message[0]._id,
      new_message.created_at = Date.parse(message[0].createdAt),
      new_message.user_id = state_user_id,
  
      new_message.text = text_to_save,
      new_message.image_url = image_to_save.url,
      new_message.image_height = image_to_save.height,
      new_message.image_width = image_to_save.width,
      new_message.image_ar = image_to_save.aspectRatio
      
    })
  })
}

const saveData = async (state) => {
  to_save = {
    status: state.status,
    total_unread_messages:state.total_unread_messages,
    theme: state.theme,
    animationOn: state.animationOn,
    first_login: state.first_login
  };
  t = Date.now()
  trace.start()
  to_save = JSON.stringify(to_save)
  await AsyncStorage.setItem(state.user_id.toString(), to_save)
  trace.stop()
  trace.putMetric('save_data_time', Date.now()-t)
}

export default (state=INITIAL_STATE, action) => {
  switch (action.type){
    case ACTIONS.LOGOUT:
      if (action.payload){
        state.socket.disconnect(true)
      }
      return {...INITIAL_STATE}

    case ACTIONS.SET_SOCKET:
      return {...state, socket: action.payload}

    case ACTIONS.CHAT_LOAD_DATA:
      user_id = action.payload.user_id
      COLORS = COLORS_DARK_THEME

      if (Object.keys(action.payload).length!==1){
        new_messages = {...action.payload.messages};
        total_unread_messages = action.payload.total_unread_messages;
        new_status = {...action.payload.status}

        if (!action.payload.theme){
          action.payload.theme=INITIAL_STATE.theme
          COLORS = COLORS_LIGHT_THEME
        }
        else{
          if (action.payload.theme==='light'){
            COLORS = COLORS_LIGHT_THEME
          }
        }
        analytics().setUserProperties({
          Theme: action.payload.theme
        })
        
        if (total_unread_messages<0){total_unread_messages=0}
        new_state = {...state,
          theme: action.payload.theme,
          animationOn: action.payload.animationOn,
          user_id, messages:new_messages, COLORS, 
          total_unread_messages, status:new_status, loaded_from_storage:true}
        saveData(new_state)
        return new_state
      }
      else{
        return {...state, user_id}
      }

    case ACTIONS.CHECK_MESSAGES_OBJECT:
      return {...state, messages: action.payload}

    case ACTIONS.CHANGE_THEME:
      COLORS = COLORS_DARK_THEME;
      if (action.payload==='light'){
        COLORS = COLORS_LIGHT_THEME;
      }
      new_state = {...state, theme: action.payload, COLORS}
      saveData(new_state) 
      return new_state

    case ACTIONS.GOT_CHAT_MESSAGE:
      return {...state}

    case ACTIONS.CHAT_AUTH_TOKEN_SET:
      return {...state, authTokenSet:true}

    case ACTIONS.CHAT_TYPING:
      new_status = {...state.status};
      if (action.payload.value){
        new_total_typing = state.total_typing + 1
      }
      else{
        new_total_typing = state.total_typing - 1
        if (new_total_typing<0){new_total_typing = 0}
      }
      new_status[action.payload.from].typing = action.payload.value
      return {...state, status: new_status, total_typing: new_total_typing}

    case ACTIONS.CHAT_USER_ONLINE:
      new_status = {...state.status};
      if (!new_status[action.payload.user_id]){
        new_status[action.payload.user_id] = {online:false, typing:false, unread_messages:0}
      }
      new_status[action.payload.user_id].online = action.payload.value
      new_status[action.payload.user_id].typing = false
      return {...state, status: new_status}

    case ACTIONS.CHAT_LOADING:
      return {...state, loading:true}

    case ACTIONS.SET_CHAT_USER_DATA:
      let other_user_data = action.payload;
      new_status = {...state.status};
      

      if (new_status.hasOwnProperty(action.payload._id)){
        total_unread_messages = state.total_unread_messages - new_status[action.payload._id].unread_messages;
        new_status[action.payload._id].unread_messages = 0
        other_user_data = {...other_user_data, newEntry: false}
      }
      else{
        total_unread_messages = state.total_unread_messages;
        other_user_data = {...other_user_data, newEntry: true}
      }

      if (total_unread_messages<0){total_unread_messages=0}
      
      new_state = {...state, status:new_status,
        other_user_data, total_unread_messages, 
        chatScreenOpen:true,
      };

      saveData(new_state)
      return new_state

    case ACTIONS.GET_CHAT_PEOPLE:
      // needs to return chats, chatPeople, status and messages
      // status: {'<other_user_id>': {online:bool, typing:bool, unread_messages:Array}}
      // messages: {'<other_user_id>': [message_objects]}
      
      const all_users = action.payload.chats
      new_messages={...state.messages}
      duplicate_status = {...state.status};
      total_unread_messages = state.total_unread_messages;
      if (state.loaded_from_storage && (Object.keys(state.status).length!==0)){
        status = {...state.status};
        all_users.map((item)=>{
          if (!status.hasOwnProperty(item._id)){
            status[item._id] = {online:false, typing:false, unread_messages:0}
          }
          (action.payload.allOnline.includes(item._id))?online=true:online=false
          status[item._id]={online, typing: false, unread_messages: status[item._id].unread_messages}
        });
      }
      else{
        status = {}
        all_users.map((item)=>{
          (action.payload.allOnline.includes(item._id))?online=true:online=false
          status[item._id]={online, typing: false, unread_messages: 0}
        });
      }

      // MessagesCollection.insertUnreadMessages(action.payload.unread_messages)
      action.payload.unread_messages.map((item)=>{
        status[item.from].unread_messages+=1;
        total_unread_messages+=1;        
      });

      if (total_unread_messages<0){total_unread_messages=0}
      if (action.payload.explicitly){status=duplicate_status}

      let new_state = {...state, chatPeople:action.payload, chats:action.payload.chats,
        loading:false, status, total_unread_messages}

      delete action.payload.chats

      saveData(new_state)
      return new_state


    case ACTIONS.CHAT_MESSAGE_HANDLER:
      // new_messages = {...state.messages};
      new_status = {...state.status};
      new_chats = [...state.chats]
      total_unread_messages = state.total_unread_messages

      // action.payload.message is [ { ... } ], is an array containing one object

      if (action.payload.isIncomming){
        analytics().logEvent("received_message")
      }
      else{
        analytics().logEvent("sent_message")
      }
      
      saveMessageInDB(action.payload, state.user_id)
      
      if (state.status.hasOwnProperty(action.payload.other_user_id)){
        new_currentMessages = [...action.payload.message, ...state.currentMessages]
        new_messages[action.payload.other_user_id] = action.payload.message;
        new_status[action.payload.other_user_id] = {online: true, typing: false, 
          unread_messages: 0};

        state.socket.emit("chat_people_explicitly");
      }
      

      if ((action.payload.other_user_id !== state.other_user_data._id) || (!state.chatScreenOpen)){
        if (new_status.hasOwnProperty(action.payload.other_user_id)){
          new_status[action.payload.other_user_id].unread_messages += 1;
          total_unread_messages+=1;
        }
      }

      if (total_unread_messages<0){total_unread_messages=0}
      new_state = {...state, loading:false, currentMessages:new_currentMessages, chats:new_chats,
        status: new_status, total_unread_messages};

      saveData(new_state)
      return new_state

    case ACTIONS.CHAT_CLEAR_OTHER_USER:
      return {...state, chatScreenOpen: false}

    case ACTIONS.CHAT_SAVE_DATA:
      saveData(state)
      return state

    case ACTIONS.SETTINGS_CHANGE_ANIMATION:
      new_state = {...state, animationOn:!state.animationOn}
      saveData(new_state)
      return new_state

    case ACTIONS.CHAT_PEOPLE_SEARCH:
      return {...state, chatPeopleSearch:action.payload, loading:false}

    case ACTIONS.CHAT_SOCKET_CHANGE_CATEGORY:
      state.socket.emit('change_favourite_category', action.payload)
      return state

    case ACTIONS.CHAT_SETUP_COMPLETE:
      state.socket.emit('user_setup_done');
      new_state = {...state, first_login:false}
      saveData(new_state)
      return new_state

    case ACTIONS.CHAT_FIRST_LOGIN:
      COLORS = COLORS_DARK_THEME;
      if (action.payload.theme==='light'){
        COLORS = COLORS_LIGHT_THEME;
      }
      new_state = {...state, first_login:action.payload.first_login, COLORS,
        user_id:action.payload.authtoken, theme:action.payload.theme}
      saveData(new_state)
      return new_state

    case ACTIONS.CHAT_GET_USER_MESSAGES:
      currentMessages = action.payload
      return {...state, currentMessages}

    default:
      return state;
  }
}