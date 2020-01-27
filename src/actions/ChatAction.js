import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT, LOG_EVENT} from '../Constants';
import axios from 'axios';
import _ from 'lodash';
import {uploadImage} from './WriteAction';
import {database} from '../database';
import { Q } from '@nozbe/watermelondb';
import naturalLanguage from '@react-native-firebase/ml-natural-language';
import perf from '@react-native-firebase/perf';
import {encrypt, decrypt} from '../encryptionUtil';

const MessagesCollection =  database.collections.get('messages');
const trace = perf().newTrace("get_chat_database");

// Bullshit to do in evey file ->
const httpClient = axios.create();
var socket=null;
var timer = null;

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = encrypt(state.login.authtoken);
    dispatch({type:ACTIONS.CHAT_AUTH_TOKEN_SET})
  }
}

export const setSocket = (new_socket) => {
  socket = new_socket;
}

// till here

export const getChatPeople = () => {
  return (dispatch) => {
    dispatch({type:ACTIONS.CHAT_LOADING})
    httpClient.get(URLS.chatpeople).then(
      (response) => {dispatch({type:ACTIONS.GET_CHAT_PEOPLE, payload:response.data});}
    ).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'CHAT ACTION - 43', description:e.toString()}))
  };
};

export const setUserData = (data) => {
  return {type:ACTIONS.SET_CHAT_USER_DATA, payload:data}
}

const encryptMessage = (message) => {
  if (message.image && message.image.url){
    message.image.url = encrypt(message.image.url)
  }
  if (message.text){
    message.text = encrypt(message.text)
  }
  return {...message}
}

export const sendMessage = (socket, message, other_user_id, image) => {
  return (dispatch) => {
    let message_to_send = {text:"", to:"", image}
    dispatch({type:ACTIONS.CHAT_IMAGE_UPLOADING, payload:{imageUploading:true}})
    if (image){
      httpClient.get(URLS.imageupload).then((response)=>{
        response.data.url = decrypt(response.data.url)
        response.data.key = decrypt(response.data.key)
        

        const psu = response.data.url;
        const pathToImage = image.url;
        const options = {contentType: "image/jpeg", uploadUrl: psu}
        uploadImage(options, pathToImage)
        .then(()=>{
          image.url = response.data.key;
          image.name = response.data.file_name
          message_to_send.text = message[0].text;
          message_to_send.to = other_user_id;

          socket.emit('message', encryptMessage(message_to_send));
          message[0].image.url = decrypt(message[0].image.url)
          
          dispatch({type:ACTIONS.CHAT_MESSAGE_HANDLER, payload:{message, other_user_id, isIncomming:false}})
        }).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'CHAT ACTION - 83, Upload to AWS S3', description:e.toString()}))
      }).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'CHAT ACTION - 84, Image Upload', description:e.toString()}))
    }
    else{
      dispatch({type:ACTIONS.CHAT_MESSAGE_HANDLER, payload:{message, other_user_id}})
      message_to_send.text = message[0].text;
      message_to_send.to = other_user_id;
      socket.emit('message', encryptMessage(message_to_send))
    }
  }
}

export const chatPeopleSearchAction = (value) => {
  return (dispatch)=>{
    if (!value){
      dispatch({type:ACTIONS.CHAT_PEOPLE_SEARCH, payload:null})
    }
    else{
      dispatch({type:ACTIONS.CHAT_LOADING});
      socket.emit('chat_people_search', value).on('chat_people_search', (response)=>{
        dispatch({type:ACTIONS.CHAT_PEOPLE_SEARCH, payload: response.chatPeopleSearch});
      })
    }
  }
}

export const logEvent = (eventType, data) => {
  if (eventType===LOG_EVENT.SCREEN_CHANGE){
    data = {screen:data, time:Date.now()}
  }
  socket.emit('log_event', {eventType,data});
}

export const setupComplete = () => {
  return {type:ACTIONS.CHAT_SETUP_COMPLETE}
}

export const sendTyping = (socket, value,other_user_id) => {
  socket.emit('typing', {to:other_user_id, value} );
  return {type:null}
}

export const getChatPeopleExplicitly = () => {
  socket.emit('chat_people_explicitly');
  return {type:ACTIONS.CHAT_LOADING}
}

export const checkMessagesObject = (other_user_id, messages) => {
  if (!_.has(messages, other_user_id)){
    messages[other_user_id] = [];
  }
  return {type:ACTIONS.CHECK_MESSAGES_OBJECT, payload:messages} 
}

const messageConverter = (item) => {
  if (!!item.text){
    text_to_save=item.text
  }
  else{
    text_to_save=null
  }
  if (!!item.image_url){
    image_to_save={
      url:item.image_url, height:item.image_height,
      width:item.image_width, aspectRatio:item.image_ar,
      name: item.image_name
    }
  }
  else{
    image_to_save=null
  }
  to_return = {
    _id:item.message_id,
    createdAt: item.created_at,
    user: {_id:item.user_id},

    text:text_to_save,
    image:image_to_save
  }
  return to_return
}

export const getCurrentUserMessages = (other_user_id, this_user_id, quickRepliesEnabled) => {
  t = Date.now()
  trace.start()
  return (dispatch)=>{
    MessagesCollection.query(Q.where('other_user_id', other_user_id)).fetch().then((response)=>{
      let new_response = []
      response.map((x)=>{
        item = x._raw
        if (item.this_user_id===this_user_id){    // imp. check, prevents chat leak into other user's chats
          new_response.unshift(messageConverter(item, this_user_id))  
        }
      });
      trace.stop()
      trace.putMetric('get_chat_database', Date.now()-t);
      logEvent(LOG_EVENT.ASYNC_STORAGE_TIME, {mili_seconds: Date.now()-t,time: Date.now(), type:'get_chat_database'})
      
      if (quickRepliesEnabled){
        clearTimeout(timer);
        timer = setTimeout(()=>{getQuickReplies(dispatch, new_response.slice(0,4), this_user_id)}, 1000)
      }

      dispatch({type:ACTIONS.CHAT_GET_USER_MESSAGES, payload:new_response})
    })
  }
}

export const clearOtherUserData = () => {
  return {type: ACTIONS.CHAT_CLEAR_OTHER_USER}
}

export const onImageSelect = (image, imageMetaData) => {
  return {type:ACTIONS.CHAT_SCREEN_IMAGE_SELECT, payload:{selectedImage:image, imageMetaData} }
}

export const onComposerTextChanged = (text)=> {
  return {type:ACTIONS.CHAT_COMPOSER_TEXT_CHANGED, payload:{text}}
}

export const getQuickReplies = (dispatch, recent_messages, local_user_id) => {
  const feedList = []
  recent_messages.reverse().map((item)=>{
    if (!(item.text && item.createdAt && item.user._id)){
      return
    }

    let obj = {text:item.text, timestamp:Date.parse(Date(item.createdAt))};
    if (item.user._id===local_user_id){
      obj.isLocalUser = true;
    }
    else{
      obj.userId= item.user._id
      obj.isLocalUser = false;
    }
    feedList.push(obj)
    return
  })

  naturalLanguage().suggestReplies(feedList)
  .then((response)=>{dispatch({type:ACTIONS.CHAT_QUICK_REPLIES, payload:response})})
  .catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'CHAT ACTION - 213, Quick Replies Error', description:e.toString()}))
}