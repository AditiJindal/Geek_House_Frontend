import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT, LOG_EVENT, MESSAGE_SPECIAL_ADDER} from '../Constants';
import {AppState} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {setSocket, getQuickReplies, logEvent} from './ChatAction';
import axios from 'axios';
import {Actions} from 'react-native-router-flux';
import io from 'socket.io-client';
import uuid from 'uuid/v4';
import {GoogleSignin} from '@react-native-community/google-signin';
import Device from 'react-native-device-info';
import analytics from '@react-native-firebase/analytics';
import messages from '@react-native-firebase/messaging';
import perf from '@react-native-firebase/perf';
import PushNotification from "react-native-push-notification";
import { encrypt, decrypt } from '../encryptionUtil';
import {setJSExceptionHandler, 
  setNativeExceptionHandler} from 'react-native-exception-handler';
import APP_INFO from '../../package.json';

const trace = perf().newTrace("get_data_async_storage");
var timer = null;
var uniqueDeviceId = null;

const getFCMToken = () => {
  if (!messages().isRegisteredForRemoteNotifications){
    messages().registerForRemoteNotifications();
  }
  return messages().getToken();
}

const httpClient = axios.create();
httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

PushNotification.popInitialNotification((notification) => {
  // console.log(notification);
})

const setPushNotifications = async () => {
  PushNotification.configure({
    onNotification: (notification) => {
      makeLocalNotification(notification)
      handleNotification(notification)
    },
    popInitialNotification:false
  });
}

setPushNotifications()

// COMMENT-OUT THERE 3 LINES
// AsyncStorage.removeItem('data')
// AsyncStorage.removeItem('authtoken')
// AsyncStorage.removeItem('5e08f8fe7554cf1c7c9f17bc')

const incomingMessageConverter = (data) => {
  new_message = [{_id:uuid(), createdAt: data.createdAt, text:data.text, 
    user:{_id:data.from, name:data.groupSender}, image:data.image}]
  return new_message
}

const makeLocalNotification = (notification) => {
  PushNotification.localNotification({
    autoCancel: true,
    largeIcon: "ic_launcher",
    smallIcon: "ic_stat_ic_notification",
    vibrate: true,
    vibration: 200,
    priority: "max",
    visibility: "private", 
    importance: "max",

    title: decrypt(notification.title),
    message: decrypt(notification.body),
  });
}

const handleNotification = (notification) => {
  switch(notification.type){
    case 'article':
      analytics().logEvent('article_notification_tapped')
      Actions.notification_article({articleData: {
        article_id: notification.article_id,
        category: notification.category,
        topic: notification.topic,
        image: notification.image,
      }})

    case 'feedback':
      Actions.jump('feedback');
      analytics().logEvent('feedback_notification_tapped')
      logEvent(LOG_EVENT.SCREEN_CHANGE, 'feedback');
  
    default:
      return null;
  }
}

const decryptMessage = (message) => {
  if (message.image && message.image.url){
    message.image.url = decrypt(message.image.url)
  }
  if (message.text){
    message.text = decrypt(message.text)
  }
  return message
}

const makeConnection = async (json_data, dispatch, getState) => {

  const t = Date.now()
  trace.start()
  AsyncStorage.getItem(json_data.authtoken.toString()).then((response)=>{
    trace.stop()
    trace.putMetric('get_async_storage_time', Date.now()-t);
    logEvent(LOG_EVENT.ASYNC_STORAGE_TIME, 
      {mili_seconds: Date.now()-t,time: Date.now(), type:'get_data_async_storage'})
    response = JSON.parse(response)

    dispatch({type:ACTIONS.CHAT_FIRST_LOGIN, 
    payload: {first_login:response.first_login, authtoken:json_data.authtoken, theme: response.theme,}})
    
    dispatch({type:ACTIONS.CHAT_LOAD_DATA, 
      payload: {...response, user_id: json_data.authtoken.toString()}})
  }).catch(()=>{})
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
      analytics().logEvent("app_went_background");
      logEvent(LOG_EVENT.SCREEN_CHANGE, 'app_went_background');
    }
    else{
      socket.emit('not-disconnected', {id: json_data.authtoken});
      analytics().logEvent("app_came_foreground");
      logEvent(LOG_EVENT.SCREEN_CHANGE, 'app_came_foreground');
      PushNotification.cancelAllLocalNotifications();
    }
  })

  let to_emit={
    id: json_data.authtoken, 
    name: json_data.data.name,
  }

  socket.emit('join', to_emit)

  socket.on('incoming_message', (data)=>{
    data = decryptMessage(data);
    const message = incomingMessageConverter(data);
    const {chat:{currentMessages, user_id, quick_replies_enabled}} = getState();
    if ((currentMessages.slice(0,4)!==0) && quick_replies_enabled){
      let temp_currentMessages = [...currentMessages.slice(0,4), ...message];
      clearTimeout(timer);
      timer = setTimeout(()=>{getQuickReplies(dispatch,temp_currentMessages, user_id);},1000)
    }
    dispatch({type:ACTIONS.CHAT_MESSAGE_HANDLER, 
      payload:{message,other_user_id: data.from, isIncomming:true}});
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

  socket.on('chat_group_participants',(response)=>{
    dispatch({type:ACTIONS.CHAT_GROUP_PARTICIPANTS, payload: response});
  })

  socket.on('create_group', (response)=>{
    dispatch({type: ACTIONS.CHAT_GROUP_CREATE, payload: response});
  })

  socket.on('chat_group_modiy_admins', (response)=>{
    message = [{
      _id: uuid(),
      createdAt: Date.now(),
      text: MESSAGE_SPECIAL_ADDER+response.specialMessage,
      user: {_id: response.group_id, name: ""}
    }]
    special_message = {message, other_user_id: response.group_id, isIncomming:true}
    dispatch({type:ACTIONS.CHAT_GROUP_MODIFY_ADMINS, payload: response})
    dispatch({type:ACTIONS.CHAT_MESSAGE_HANDLER, 
      payload:special_message});
  });

  socket.on('you-are-disconnected', ()=>{
    socket.emit('not-disconnected', {id: json_data.authtoken});
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

  manufacturer = await Device.getManufacturer();
  designName = await Device.getDevice();
  phoneModel = Device.getModel();
  totalMemory = await Device.getTotalMemory();
  carrier = await Device.getCarrier();
  uniqueDeviceId = await Device.getUniqueId();
  firstInstall = await Device.getFirstInstallTime();
  freeDisk = await Device.getFreeDiskStorage();
  IPAddress = await Device.getIpAddress();
  lastUpdatedApp = await Device.getLastUpdateTime();
  macAddress = await Device.getMacAddress();
  osVersion = await Device.getSystemVersion();
  currentAppVersion = APP_INFO.version;
  
  let fullDeviceInfo = {
    deviceInfo: {manufacturer, designName, phoneModel, totalMemory},
    carrier,
    freeDisk, IPAddress,
    uniqueDeviceId, firstInstall, lastUpdatedApp,
    macAddress, currentAppVersion, osVersion
  }
  socket.emit('device_info', fullDeviceInfo)

  setJSExceptionHandler((e, isFatal)=>{
    if (isFatal){
      logEvent(LOG_EVENT.ERROR, 
        {errorLine: `Global JS_Exception`, description:JSON.stringify(e)})
    }
    else{
      return null;
    }
  });

  setNativeExceptionHandler((e, isFatal)=>{
    if (isFatal){
      logEvent(LOG_EVENT.ERROR, 
        {errorLine: `Global Native_Exception`, description:JSON.stringify(e)})
    }
    else{
      return null;
    }
  });
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
        }
        else{
          dispatch({type:ACTIONS.LOGOUT})
        }
      }
  ).catch(()=>{})
}
}


export const loginGoogle = () => {
  return (dispatch, getState)=>{
    dispatch({type:ACTIONS.LOADING_GOOGLE, payload:true});
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
        pushToken: pushToken
      };

      let data_to_send = new_data
      data_to_send.id = encrypt(data_to_send.id);
      data_to_send.pushToken = encrypt(data_to_send.pushToken)

      httpClient.post(URLS.login, data_to_send).then(
        (response) => {
          new_data.name = response.data.name
          new_data.image_url = response.data.image_url

          authtoken = response.data.token
          final_data = {data:new_data, authtoken:authtoken, 
            categories:response.data.categories}
          analytics().setUserId(authtoken);
          to_save = JSON.stringify(final_data);
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
          makeConnection(final_data, dispatch, getState);
          Actions.replace("main");
        }
      ).catch(e=>{
        dispatch({type:ACTIONS.LOADING_GOOGLE, payload:false})})
    }).catch(e=>{
      dispatch({type:ACTIONS.LOADING_GOOGLE, payload:false})})
  }
}

export const loginFacebook = () => {
  return (dispatch, getState) => {
    dispatch({type:ACTIONS.LOADING_FB, payload:true});
    LoginManager.logInWithPermissions(["public_profile", "email"]).then((response)=>{
      if (response.isCancelled){
        dispatch({type:ACTIONS.LOADING_FB, payload:false});
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
                    id: data.id+'facebook', 
                    name:data.name, 
                    email:data.email, 
                    image_url:data.picture.data.url,
                    pushToken: pushToken
                  }

                  let data_to_send = new_data
                  data_to_send.id = encrypt(data_to_send.id);
                  data_to_send.pushToken = encrypt(data_to_send.pushToken)
                  
                  httpClient.post(URLS.login, data_to_send).then(
                    (response) => {
                      new_data.name = response.data.name
                      new_data.image_url = response.data.image_url
                      
                      authtoken = response.data.token
                      final_data = {data:new_data, authtoken:authtoken, 
                        categories:response.data.categories}
                      analytics().setUserId(authtoken);
                      
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
                    dispatch({type:ACTIONS.LOADING_FB, payload:false});})
                }
              ).catch(e=>{
                dispatch({type:ACTIONS.LOADING_FB, payload:false})})
            }
          ).catch(e=>{
            dispatch({type:ACTIONS.LOADING_FB, payload:false})})
        }).catch(e=>{
          dispatch({type:ACTIONS.LOADING_FB, payload:false})})
      }
    }).catch(e=>{
    dispatch({type:ACTIONS.LOADING_FB, payload:false});
  });
  }
}

export const getPolicy = () => {
  return (dispatch) => {
    httpClient.get(URLS.policy).then((response)=>{
      dispatch({type:ACTIONS.LOGIN_POLICY, payload: response.data})
    })
  }
}

export const internetHandler = (internetReachable) => {
  return {type:ACTIONS.LOGIN_INTERNET_REACHABLE, payload:internetReachable}
}