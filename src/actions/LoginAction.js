import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT} from '../Constants';
import {AppState,Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
// import * as Facebook from 'expo-facebook';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {setSocket} from './ChatAction'
// import * as GoogleSignIn from 'expo-google-sign-in';
import axios from 'axios';
import {Actions} from 'react-native-router-flux';
import io from 'socket.io-client';
import uuid from 'uuid/v4';
import {GoogleSignin} from '@react-native-community/google-signin';
import Device from 'react-native-device-info';
import * as RNLocalize from "react-native-localize";
import OneSignal from 'react-native-onesignal';
// import { Notifications } from 'expo';


const id = "Chat"
const channel = {
  name: "Chat",
  description: "Chat notifications in Geek House",
  sound: true,
  priority: "high",
  vibrate: "[ 0, 5000 ]",
  badge: true
}

var deviceNotificationId = null; 

OneSignal.init("79514e5e-4676-44b7-822e-8941eacb88d0");
OneSignal.addEventListener('received', (x)=>{console.log("Got this in notif rec: ", x)});
OneSignal.addEventListener('opened', (x)=>{console.log("Got this in notif open: ", x)});
OneSignal.getPermissionSubscriptionState((obj)=>
{console.log(obj);deviceNotificationId = obj.userId;}
);



// Notifications.createCategoryAsync('Chats and Messages', 
//   [{actionId:'Tap_To_See', buttonTitle:'Tap to reply'}])
// Notifications.createChannelAndroidAsync(id, channel);


const httpClient = axios.create();
httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

// new_data = {
// 	"name":"Tushar Jain",
// 	"email":"tusharlock10@gmail.com",
// 	"id":132132312,
// 	"image_url":""
// }
// httpClient.post(URLS.login, new_data).then(
//   (response) => {
//     authtoken = response.data.token
//     to_save = JSON.stringify({data:new_data, authtoken:authtoken})
//     AsyncStorage.setItem('data', to_save)
//   }
// )

// AsyncStorage.removeItem('data')
// AsyncStorage.removeItem('authtoken')


const incomingMessageConverter = (data) => {
  // data = {text: "jdhd", from: "76763273yhbdhgv67", createdAt}
  // new_message = [{_id:"message id", createdAt:"date", text:"text here", user:{_id:"data.from"}}]
  new_message = [{_id:uuid(), createdAt: data.createdAt, text:data.text, user:{_id:data.from}, image:data.image}]
  return new_message
}

export const gotLoginData = (data) => {
  return {
    type:ACTIONS.LOGIN_DATA,
    payload:data
  };
}

const makeConnection = async (json_data, dispatch) => {
  // console.log("in make connectino")
  AsyncStorage.getItem(json_data.authtoken.toString()).then((response)=>{
    response = JSON.parse(response)
    dispatch(
      {type:ACTIONS.CHAT_LOAD_DATA, payload: {...response, user_id: json_data.authtoken.toString()}}
      )
  });
  dispatch({type:ACTIONS.LOGIN_DATA, payload:{data:json_data.data, authtoken:json_data.authtoken, categories:json_data.categories}})
  const socket = io(BASE_URL);
  setSocket(socket)

  AppState.addEventListener('change', (appState)=>{
    if ((appState==='background') || (appState==='inactive')){
      socket.emit('send-me-offline', {id: json_data.authtoken})
    }
    else{
      socket.emit('not-disconnected', {id: json_data.authtoken})
    }
  })
  

  // console.log('Device: ', Device);
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
    connectionType: 'null'
  }
  // to_emit={}
  // console.log("To emit: ", to_emit)
  socket.emit('join', to_emit)

  socket.on('incoming_message', (data)=>{
    // dispatch({type:ACTIONS.GOT_CHAT_MESSAGE, payload: data})
    dispatch({type:ACTIONS.CHAT_MESSAGE_HANDLER, payload:
      {message:incomingMessageConverter(data),other_user_id: data.from}})
  });

  socket.on('incoming_typing', (data)=>{
    // // console.log("Incmming typing: ", data)
    dispatch({type:ACTIONS.CHAT_TYPING, payload: data})
  });

  socket.on('chat_people', (data)=> {
    // console.log('Got data: ', data)
    dispatch({type:ACTIONS.GET_CHAT_PEOPLE, payload:data});
  });

  socket.on('online', (data)=> {4
    // console.log("got online: ", data)
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

  socket.on('reconnect', (data)=>{
    socket.emit('not-disconnected', {id: json_data.authtoken})
  })

  socket.on('disconnect', (e)=> {
    dispatch({type:ACTIONS.CHAT_SAVE_DATA})
  });
  
  dispatch({type:ACTIONS.SET_SOCKET, payload: socket});
}

export const checkLogin = () => {
  return (dispatch) => {
    // dispatch({type:ACTIONS.CHECKING_LOGIN})
    AsyncStorage.getItem('data').then(
      (response) => {
        if(response!==null && Object.keys(response).length!==0){
          json_data = JSON.parse(response)
          // // console.log("here 0, json_data: ", json_data)
          // Image.prefetch(json_data.data.image_url)
          makeConnection(json_data, dispatch)
          Actions.replace("main");
        }
        else{
          dispatch({type:ACTIONS.LOGOUT})
        }
      }
  )}
}


// export const loginGoogle = () => {
//   return (dispatch)=> {
//     dispatch({type:ACTIONS.LOADING_GOOGLE});
//     GoogleSignIn.initAsync({}).then(()=>{
//       GoogleSignIn.askForPlayServicesAsync().then(()=>{
//         GoogleSignIn.signInAsync().then((response)=>{
//           GoogleSignIn.getPhotoAsync(200).then(
//             (image_response) => {
//             if (response.type==='success'){

//               Notifications.getExpoPushTokenAsync().then((pushToken) => {
//                 let new_data = {
//                   id: response.user.uid+'google',
//                   name: response.user.displayName, 
//                   email: response.user.email,
//                   image_url: image_response,//response.user.photoURL,
//                   pushToken
//                 };
//                 httpClient.post(URLS.login, new_data).then(
//                   (response) => {
//                     authtoken = response.data.token
//                     final_data = {data:new_data, authtoken:authtoken, categories:response.data.categories}
//                     to_save = JSON.stringify(final_data)
//                     AsyncStorage.setItem('data', to_save)
//                     dispatch({type:ACTIONS.LOGIN_FIRST_LOGIN, payload: response.data.first_login})
//                     dispatch({type:ACTIONS.LOGIN_DATA, payload:final_data});
//                     // Image.prefetch(final_data.data.image_url)
//                     makeConnection(final_data, dispatch);
//                     Actions.replace("main");
//                   }
//                 );
//               })  
//             }}
//           )
//         });
//       })
//     })
//   }
// }


export const loginGoogle = () => {
  return (dispatch)=>{
    GoogleSignin.configure({
      androidClientId: "315957273790-l39qn5bp73tj2ug8r46ejdcj5t2gb433.apps.googleusercontent.com",
      webClientId: "315957273790-o4p20t2j3brt7c8bqc68814pj63j1lum.apps.googleusercontent.com"
    });
    GoogleSignin.signIn().then((response)=>{
      // Notifications.getExpoPushTokenAsync().then((pushToken) => {
      let new_data = {
        id: response.user.id+'google',
        name: response.user.name, 
        email: response.user.email,
        image_url: response.user.photo,//response.user.photoURL,
        pushToken:deviceNotificationId
      };
      httpClient.post(URLS.login, new_data).then(
        (response) => {
          authtoken = response.data.token
          final_data = {data:new_data, authtoken:authtoken, categories:response.data.categories}
          to_save = JSON.stringify(final_data)
          AsyncStorage.setItem('data', to_save)
          dispatch({type:ACTIONS.LOGIN_FIRST_LOGIN, payload: response.data.first_login})
          dispatch({type:ACTIONS.LOGIN_DATA, payload:final_data});
          // Image.prefetch(final_data.data.image_url)
          makeConnection(final_data, dispatch);
          Actions.replace("main");
        }
      );
      // })
    })
  }
}

export const loginFacebook = () => {
  return (dispatch) => {
    dispatch({type:ACTIONS.LOADING_FB});
    LoginManager.logInWithPermissions(["public_profile", "email"]).then((response)=>{
      if (response.isCancelled){
        Alert.alert("Login Cancelled");
        dispatch({type:ACTIONS.LOGIN_ERROR, payload:response.type});
      }
      else{
        AccessToken.getCurrentAccessToken().then((response)=>{
          const token = response.accessToken;
          const userId = response.userID;


          fetch(`https://graph.facebook.com/${userId}?fields=email,picture.type(large),name&access_token=${token}`).then(
            (response) => {
              response.json().then(
                (data) => {
                  // Notifications.getExpoPushTokenAsync().then((pushToken)=>{
                  let new_data = {
                    id:data.id+'facebook', 
                    name:data.name, 
                    email:data.email, 
                    image_url:data.picture.data.url,
                    pushToken:deviceNotificationId
                  }
                  httpClient.post(URLS.login, new_data).then(
                    (response) => {
                      authtoken = response.data.token
                      final_data = {data:new_data, authtoken:authtoken, categories:response.data.categories}
                      to_save = JSON.stringify(final_data)
                      AsyncStorage.setItem('data', to_save)
                      dispatch({type:ACTIONS.LOGIN_FIRST_LOGIN, payload: response.data.first_login})
                      dispatch({type:ACTIONS.LOGIN_DATA, payload:final_data});
                      // Image.prefetch(final_data.data.image_url);
                      makeConnection(final_data, dispatch)
                      Actions.replace("main");
                    }
                  );
                  // })
                }
              )
            }
          )
        })
      }
    })
  };
}