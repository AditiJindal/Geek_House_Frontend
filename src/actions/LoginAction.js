import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT} from '../Constants';
import {AppState,Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {setSocket} from './ChatAction'
import axios from 'axios';
import {Actions} from 'react-native-router-flux';
import io from 'socket.io-client';
import uuid from 'uuid/v4';
import {GoogleSignin} from '@react-native-community/google-signin';
import Device from 'react-native-device-info';
import * as RNLocalize from "react-native-localize";
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {getQuickReplies} from './ChatAction';
import messages from '@react-native-firebase/messaging';

var timer = null;

const getFCMToken = () => {
  if (!messages().isRegisteredForRemoteNotifications){
    messages().registerForRemoteNotifications();
  }
  return messages().getToken();
}

const httpClient = axios.create();
httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

// COMMENT-OUT THERE 3 LINES
// AsyncStorage.removeItem('data')
// AsyncStorage.removeItem('authtoken')
// AsyncStorage.removeItem('5e08f8fe7554cf1c7c9f17bc')

const incomingMessageConverter = (data) => {
  new_message = [{_id:uuid(), createdAt: data.createdAt, text:data.text, 
    user:{_id:data.from}, image:data.image}]
  return new_message
}


const makeConnection = async (json_data, dispatch, getState) => {
  AsyncStorage.getItem(json_data.authtoken.toString()).then((response)=>{
    response = JSON.parse(response)

    dispatch({type:ACTIONS.CHAT_FIRST_LOGIN, 
    payload: {first_login:response.first_login, authtoken:json_data.authtoken, theme: response.theme,}})
    
    dispatch({type:ACTIONS.CHAT_LOAD_DATA, 
      payload: {...response, user_id: json_data.authtoken.toString()}})
  }).catch(e=>crashlytics().log("LoginAction LINE 56"+e.toString()))
  dispatch({type:ACTIONS.LOGIN_DATA, payload:{data:json_data.data,
    authtoken:json_data.authtoken, categories:json_data.categories}})
  const socket = io.connect(BASE_URL, {
    timeout: HTTP_TIMEOUT,
    forceNew:true,
    reconnectionDelay:500,
    transports: ['websocket'],
    autoConnect: true,
  });
  setSocket(socket)

  AppState.addEventListener('change', (appState)=>{
    if ((appState==='background') || (appState==='inactive')){
      socket.emit('send-me-offline', {id: json_data.authtoken});
      analytics().logEvent("app_went_background")
    }
    else{
      socket.emit('not-disconnected', {id: json_data.authtoken});
      analytics().logEvent("app_came_foreground")
    }
  })
  
  manufacturer = await Device.getManufacturer();
  designName = await Device.getDevice(),
  modelName = Device.getModel(),
  osName = await Device.getBaseOs(),
  totalMemory = await Device.getTotalMemory(),
  carrier = await Device.getCarrier();


  let to_emit={
    id: json_data.authtoken, 
    name: json_data.data.name,
    deviceInfo: {manufacturer,designName,modelName,osName,totalMemory},
    carrier,
    countryCode: RNLocalize.getCountry(),
  }

  socket.emit('join', to_emit)

  socket.on('incoming_message', (data)=>{
    const message = incomingMessageConverter(data);
    const {chat} = getState();
    let temp_currentMessages = chat.currentMessages.slice(0,3);
    if (temp_currentMessages.length!==0){
      temp_currentMessages.push(message[0]);
      clearTimeout(timer);
      timer = setTimeout(()=>{getQuickReplies(dispatch,temp_currentMessages, chat.user_id);},500)
    }
    dispatch({type:ACTIONS.CHAT_MESSAGE_HANDLER, payload:{message,other_user_id: data.from, isIncomming:true}});
  });

  socket.on('incoming_typing', (data)=>{
    dispatch({type:ACTIONS.CHAT_TYPING, payload: data})
  });

  socket.on('chat_people', (data)=> {
    dispatch({type:ACTIONS.GET_CHAT_PEOPLE, payload:data});
  });

  socket.on('online', (data)=> {4
    if (data.user_id!==json_data.authtoken){
      dispatch({type:ACTIONS.CHAT_USER_ONLINE, payload: data})
    }
  });

  socket.on('unread_messages', (data)=>{
    dispatch({type:ACTIONS.CHAT_UNREAD_MESSAGES, payload: data})
  });

  socket.on('you-are-disconnected', ()=>{
    socket.emit('not-disconnected', {id: json_data.authtoken})
  })

  socket.on('reconnect', ()=>{
    analytics().logEvent("app_reconnected")
    socket.emit('not-disconnected', {id: json_data.authtoken,
      name:json_data.data.name})
  })

  socket.on('disconnect', ()=> {
    analytics().logEvent("app_disconnected")
    dispatch({type:ACTIONS.CHAT_SAVE_DATA})
  });
  
  dispatch({type:ACTIONS.SET_SOCKET, payload: socket});
}

export const checkLogin = () => {
  return (dispatch, getState) => {
    AsyncStorage.getItem('data').then(
      (response) => {
        if(response!==null && Object.keys(response).length!==0){
          json_data = JSON.parse(response)
          makeConnection(json_data, dispatch, getState)
          Actions.replace("main");
          analytics().setUserId(json_data.data.authtoken);
          crashlytics().setUserId(json_data.data.authtoken);
          crashlytics().setUserEmail(json_data.data.email);
          crashlytics().setUserName(json_data.data.name);
        }
        else{
          dispatch({type:ACTIONS.LOGOUT})
        }
      }
  ).catch(e=>crashlytics().log("LoginAction LINE 161"+e.toString()))
}
}


export const loginGoogle = () => {
  return (dispatch, getState)=>{
    GoogleSignin.configure({
      androidClientId: "315957273790-l39qn5bp73tj2ug8r46ejdcj5t2gb433.apps.googleusercontent.com",
      webClientId: "315957273790-o4p20t2j3brt7c8bqc68814pj63j1lum.apps.googleusercontent.com",
      forceConsentPrompt: true
    });
    GoogleSignin.signIn().then(async (response)=>{
      pushToken = await getFCMToken()
      let new_data = {
        id: response.user.id+'google',
        name: response.user.name, 
        email: response.user.email,
        image_url: response.user.photo,//response.user.photoURL,
        pushToken
      };
      httpClient.post(URLS.login, new_data).then(
        (response) => {
          authtoken = response.data.token
          final_data = {data:new_data, authtoken:authtoken, 
            categories:response.data.categories, theme:response.data.theme}
          analytics().setUserId(authtoken);
          crashlytics().setUserId(authtoken);
          crashlytics().setUserEmail(new_data.email);
          crashlytics().setUserName(new_data.name);
          to_save = JSON.stringify(final_data)
          AsyncStorage.setItem('data', to_save)
          if (response.data.first_login){
            analytics().logSignUp({method:'google'})
          }
          else{
            analytics().logLogin({method:'google'})
          }
          dispatch({type:ACTIONS.CHAT_FIRST_LOGIN, 
            payload: {first_login:response.data.first_login, theme:response.data.theme,
              authtoken:final_data.authtoken}})
          dispatch({type:ACTIONS.LOGIN_DATA, payload:final_data});
          // Image.prefetch(final_data.data.image_url)
          makeConnection(final_data, dispatch, getState);
          Actions.replace("main");
        }
      ).catch(e=>{
        crashlytics().log("LoginAction LINE 208"+e.toString());
        Alert.alert("Here 5",e.toString())})
      // })
    }).catch(e=>{
      Alert.alert("Here 4",e.toString());
      crashlytics().log("LoginAction LINE 211"+e.toString())})
  }
}

export const loginFacebook = () => {
  return (dispatch, getState) => {
    dispatch({type:ACTIONS.LOADING_FB});
    LoginManager.logInWithPermissions(["public_profile", "email"]).then((response)=>{
      if (response.isCancelled){
        dispatch({type:ACTIONS.LOGIN_ERROR, payload:response.type});
      }
      else{
        AccessToken.getCurrentAccessToken().then((response)=>{
          const token = response.accessToken;
          const userId = response.userID;


          fetch(`https://graph.facebook.com/${userId}?fields=email,picture.type(large),name&access_token=${token}`).then(
            (response) => {
              response.json().then(
                async (data) => {
                  pushToken = await getFCMToken()
                  let new_data = {
                    id:data.id+'facebook', 
                    name:data.name, 
                    email:data.email, 
                    image_url:data.picture.data.url,
                    pushToken
                  }
                  
                  httpClient.post(URLS.login, new_data).then(
                    (response) => {
                      authtoken = response.data.token
                      final_data = {data:new_data, authtoken:authtoken, 
                        categories:response.data.categories}
                      analytics().setUserId(authtoken);
                      crashlytics().setUserId(authtoken);
                      crashlytics().setUserEmail(data.email);
                      crashlytics().setUserName(data.name);
                      
                      to_save = JSON.stringify(final_data)
                      AsyncStorage.setItem('data', to_save)
                      if (response.data.first_login){
                        analytics().logSignUp({method:'facebook'})
                      }
                      else{
                        analytics().logLogin({method:'facebook'})
                      }
                      dispatch({type:ACTIONS.CHAT_FIRST_LOGIN, 
                        payload: {first_login:response.data.first_login, theme:response.data.theme,
                          authtoken:final_data.authtoken}})
                      dispatch({type:ACTIONS.LOGIN_DATA, payload:final_data});
                      makeConnection(final_data, dispatch, getState)
                      Actions.replace("main");
                    }
                  ).catch(e=>{
                    crashlytics().log("LoginAction LINE 272"+e.toString());
                    Alert.alert("Here 3",e.toString())})
                  // })
                }
              ).catch(e=>crashlytics().log("LoginAction LINE 276"+e.toString()))
            }
          ).catch(e=>{
            crashlytics().log("LoginAction LINE 277"+e.toString());
            Alert.alert("Here 2",e.toString())})
        })
      }
    }).catch(e=>{
    crashlytics().log("LoginAction LINE 280"+e.toString())
    Alert.alert("Here 1",e.toString());crashlytics().log("LoginAction:loginFacebook:logInWithPermissions")
    ;crashlytics().recordError(e)})
  };
}