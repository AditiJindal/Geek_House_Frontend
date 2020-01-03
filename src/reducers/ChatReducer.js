import {ACTIONS} from '../actions/types';
import uuid from 'uuid/v4';
import AsyncStorage from '@react-native-community/async-storage';
import {COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import analytics from '@react-native-firebase/analytics';
import perf from '@react-native-firebase/perf';

const INITIAL_STATE={
  socket: null,
  loading:true,
  chatPeople:{},
  chats: [],
  messages: {},
  other_user_data: {},
  status: {}, // {"user_id":{online: true, typing: false, unread_messages: 2}}
  total_typing: 0,
  total_unread_messages: 0,
  chatScreenOpen: false,
  loaded_from_storage: false,
  user_id: "",
  theme: "light",
  animationOn:true,
  chatPeopleSearchLoading:false,
  authTokenSet: false,
  chatPeopleSearch:null,
  COLORS: COLORS_LIGHT_THEME
}

const trace = perf().newTrace("save_data")

const incomingMessageConverter = (data) => {
  new_message = [
    {_id:uuid(), createdAt: data.createdAt, text:data.text,image:data.image, user:{_id:data.from}}
  ]
  return new_message
}

const saveData = async (state) => {
  to_save = {
    messages:state.messages,
    status: state.status,
    total_unread_messages:state.total_unread_messages,
    theme: state.theme,
    animationOn: state.animationOn
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
        all_users.forEach((item)=>{
          if (!status.hasOwnProperty(item._id)){
            status[item._id] = {online:false, typing:false, unread_messages:0}
          }
          (action.payload.allOnline.includes(item._id))?online=true:online=false
          status[item._id]={online, typing: false, unread_messages: status[item._id].unread_messages}
        });
      }
      else{
        status = {}
        all_users.forEach((item)=>{
          (action.payload.allOnline.includes(item._id))?online=true:online=false
          status[item._id]={online, typing: false, unread_messages: 0}
        });
      }

      action.payload.unread_messages.forEach((item)=>{
        if (new_messages.hasOwnProperty(item.from)){
          new_messages[item.from] = incomingMessageConverter(item).concat(new_messages[item.from]);
        }
        else{
          new_messages[item.from]=incomingMessageConverter(item);
        }
        status[item.from].unread_messages+=1;
        total_unread_messages+=1;        
      });

      if (total_unread_messages<0){total_unread_messages=0}
      if (action.payload.explicitly){status=duplicate_status}

      let new_state = {...state, chatPeople:action.payload, chats:action.payload.chats,
        loading:false, status, total_unread_messages, messages:new_messages}

      delete action.payload.chats

      saveData(new_state)
      return new_state


    case ACTIONS.CHAT_MESSAGE_HANDLER:
      new_messages = {...state.messages};
      new_status = {...state.status};
      new_chats = [...state.chats]
      total_unread_messages = state.total_unread_messages

      if (action.payload.isIncomming){
        analytics().logEvent("received_message")
      }
      else{
        analytics().logEvent("sent_message")
      }
      
      if (state.messages.hasOwnProperty(action.payload.other_user_id)){
        new_messages[action.payload.other_user_id] = action.payload.message
        .concat(state.messages[action.payload.other_user_id]);
      }
      else{
        new_messages[action.payload.other_user_id] = action.payload.message;
        // state.socket.emit("get_new_entry_data",{id:action.payload.other_user_id});

        new_status[action.payload.other_user_id] = {online: true, typing: false, 
          unread_messages: 0};
        // add this users in the chatPeople.chats
        // new_chats.push(response.entry)

        state.socket.emit("chat_people_explicitly");
      }

      if ((action.payload.other_user_id !== state.other_user_data._id) || (!state.chatScreenOpen)){
        if (new_status.hasOwnProperty(action.payload.other_user_id)){
          new_status[action.payload.other_user_id].unread_messages += 1;
          total_unread_messages+=1;
        }
      }

      if (total_unread_messages<0){total_unread_messages=0}
      new_state = {...state, loading:false, messages:new_messages, chats:new_chats,
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
      // console.log("Saving this: ", new_state)
      return new_state

    case ACTIONS.CHAT_PEOPLE_SEARCH:
      return {...state, chatPeopleSearch:action.payload, loading:false}

    default:
      return state;
  }
}