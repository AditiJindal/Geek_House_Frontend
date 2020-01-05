import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT} from '../Constants';
import axios from 'axios';
// import console = require('console');

// Bullshit to do in evey file ->
const httpClient = axios.create();

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = state.login.authtoken;
  }
}
// till here

export const getSettingsData = (reload) => {
  return (dispatch, getState) => {
    const state = getState();

    if (reload || !state.settings.gotSettingsData){
      // // console.log(" i m reloading data: ")
      httpClient.get(URLS.settings).then((response)=>{
        dispatch({type: ACTIONS.GET_SETTINGS_DATA, payload: response.data})
      })
    }
  }
}

export const settingsChangeFavouriteCategory = (selected_category) => {
  return {type:ACTIONS.CHAT_SOCKET_CHANGE_CATEGORY, payload: selected_category}
}

export const changeAnimationSettings = () => {
  return {type:ACTIONS.SETTINGS_CHANGE_ANIMATION}
}

export const changeTheme = (value) => {
  return {type:ACTIONS.CHANGE_THEME, payload: value}
}