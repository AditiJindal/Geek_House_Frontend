import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT} from '../Constants';
import axios from 'axios';
import _ from 'lodash';
import {uploadImage} from './WriteAction';

// Bullshit to do in evey file ->
const httpClient = axios.create();
var socket=null

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = state.login.authtoken;
    dispatch({type:null})
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
    );
  };
};

export const setUserData = (data) => {
  return {type:ACTIONS.SET_CHAT_USER_DATA, payload:data}
}

export const sendMessage = (socket, message, other_user_id, image) => {
  return (dispatch) => {
    let message_to_send = {text:"", to:"", image}
    if (image){
      httpClient.get(URLS.imageupload).then((response)=>{
        const psu = response.data.url;
        const pathToImage = image.url;
        const options = {contentType: "image/jpeg", uploadUrl: psu}
        uploadImage(options, pathToImage)
        .then(()=>{
          image.url = response.data.key;
          image.name = response.data.file_name
          message_to_send.text = message[0].text;
          message_to_send.to = other_user_id;
          socket.emit('message', message_to_send)
          dispatch({type:ACTIONS.CHAT_MESSAGE_HANDLER, payload:{message, other_user_id}})
        })
      })
    }
    else{
      message_to_send.text = message[0].text;
      message_to_send.to = other_user_id;
      socket.emit('message', message_to_send)
      dispatch({type:ACTIONS.CHAT_MESSAGE_HANDLER, payload:{message, other_user_id}})
    }
  }
}

export const logEvent = (eventType, data) => {
  socket.emit('log_event', {eventType,data});
}

export const sendTyping = (socket, value,other_user_id) => {
  socket.emit('typing', {to:other_user_id, value} );
  return {type:null}
}

export const checkMessagesObject = (other_user_id, messages) => {
  // // console.log("MESSAGES:: ",)
  if (!_.has(messages, other_user_id)){
    messages[other_user_id] = [];
  }
  return {type:ACTIONS.CHECK_MESSAGES_OBJECT, payload:messages} 
}

export const clearOtherUserData = () => {
  return {type: ACTIONS.CHAT_CLEAR_OTHER_USER}
}