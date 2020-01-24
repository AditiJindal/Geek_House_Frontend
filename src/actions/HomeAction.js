import AsyncStorage from '@react-native-community/async-storage';
import {ACTIONS} from './types';
import {logEvent} from './ChatAction';
import {uploadImage} from './WriteAction';
import {URLS, BASE_URL, HTTP_TIMEOUT, LOG_EVENT} from '../Constants';
import axios from 'axios';
import {encrypt, decrypt} from '../encryptionUtil';
import {Actions} from 'react-native-router-flux';
import {NativeAdsManager, AdSettings} from 'react-native-fbads';

// Bullshit to do in evey file ->
const httpClient = axios.create();

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = encrypt(state.login.authtoken)
    dispatch({type:null})
  }
}
// till here


export const logout = () => {
  httpClient.get(URLS.logout)
  return (dispatch) => {
    Actions.replace("login_main"); logEvent(LOG_EVENT.SCREEN_CHANGE, 'login_main');
    AsyncStorage.removeItem('data').then(
      () => {
        dispatch({type:ACTIONS.LOGOUT, payload:true});
      }
    ).catch(e=>crashlytics().log("HomeAction LINE 35"+e.toString()))
  }
}

export const toggleOverlay = (overlay) => {
  return {type:ACTIONS.TOGGLE_OVERLAY, payload:overlay}
}

export const getWelcome = () => {
  return (dispatch) => {
    dispatch({type:ACTIONS.HOME_LOADING});

    AdSettings.addTestDevice(AdSettings.currentDeviceHash);
    let adsManager = new NativeAdsManager('2458153354447665_2459775687618765', 10);
    adsManager.setMediaCachePolicy('all');

    httpClient.get(URLS.welcome).then(
      (response) => {
        if (response.data.error){
          AsyncStorage.removeItem('data').then(
            () => {
              dispatch({type:ACTIONS.LOGOUT});
              Actions.replace("login_main");logEvent(LOG_EVENT.SCREEN_CHANGE, 'login_main');
            }
          ).catch(e=>crashlytics().log("HomeAction LINE 54"+e.toString()))
        }
        else{
          dispatch({type:ACTIONS.WELCOME, payload: {...response.data, adsManager}})
        }
      }
    ).catch(
      (e) => {
        crashlytics().log("HomeAction LINE 61"+e.toString());
        dispatch({type:ACTIONS.HOME_ERROR, payload: "Sorry, could not connect to the server!"})}
    )
  }      
};


export const submitFeedback = (feedback_obj) => {
  // this function is responsible for uploading data, 
  //nothing will be passed to the reducer
  return (dispatch) => {
    const local_image_url = feedback_obj.image_url
    if (local_image_url){
      httpClient.get(URLS.imageupload).then((response)=>{
        const preSignedURL = decrypt(response.data.url);
        uploadImage({contentType: "image/jpeg", uploadUrl: preSignedURL}, local_image_url)
        .then(()=>{
          feedback_obj.image_url = decrypt(response.data.key);
          httpClient.post(URLS.feedback, feedback_obj)
        }).catch(e=>crashlytics().log("HomeAction LINE 80"+e.toString()))
      }).catch(e=>crashlytics().log("HomeAction LINE 81"+e.toString()))
    }
    else{
      httpClient.post(URLS.feedback, feedback_obj)
    }
  }
}