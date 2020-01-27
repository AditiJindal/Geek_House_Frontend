import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT} from '../Constants';
import uuid from 'uuid';
import axios from 'axios';
import RNFileSystem from 'react-native-fs';
import {encrypt} from '../encryptionUtil';

// Bullshit to do in evey file ->
const httpClient = axios.create();

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = encrypt(state.login.authtoken);
  }
}
// till here

export const getSettingsData = (reload) => {
  return (dispatch, getState) => {
    const state = getState();

    if (reload || !state.settings.gotSettingsData){
      httpClient.get(URLS.settings).then((response)=>{
        dispatch({type: ACTIONS.GET_SETTINGS_DATA, payload: response.data})
      }).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'SEARCH ACTION - 30', description:e.toString()}))
    }
  }
}

export const settingsChangeFavouriteCategory = (selected_category) => {
  return {type:ACTIONS.CHAT_SOCKET_CHANGE_CATEGORY, payload: selected_category}
}

export const changeAnimationSettings = () => {
  return {type:ACTIONS.SETTINGS_CHANGE_ANIMATION}
}

export const changeQuickRepliesSettings = () => {
  return {type:ACTIONS.SETTINGS_CHANGE_QUICK_REPLIES}
}

export const changeTheme = (value) => {
  return {type:ACTIONS.CHANGE_THEME, payload: value}
}

export const changeChatWallpaper = (response, previous_image) => {  
  return (dispatch) => {
    const target_path = RNFileSystem.ExternalStorageDirectoryPath+"/GeekHouse/"+`${uuid()}.jpg`
    const target_path_url =  `file://`+target_path
    if (previous_image){
      RNFileSystem.unlink(previous_image.substring(7)).catch(()=>{})
    }
    RNFileSystem.copyFile(response.path, target_path).then(()=>{
      dispatch({type: ACTIONS.CHANGE_CHAT_BACKGROUND, payload:target_path_url})
    })
  }
}

export const changeBlurRadius = (blur) => {
  return {type:ACTIONS.CHANGE_CHAT_BACKGROUND_BLUR, payload:blur}
}