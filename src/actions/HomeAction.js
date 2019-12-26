import AsyncStorage from '@react-native-community/async-storage';
import {ACTIONS} from './types';
import {logEvent} from './ChatAction';
import {URLS, BASE_URL, HTTP_TIMEOUT, LOG_EVENT} from '../Constants';
import axios from 'axios';
import {Actions} from 'react-native-router-flux';
// import console = require('console');

// Bullshit to do in evey file ->
const httpClient = axios.create();

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = state.login.authtoken;
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
        dispatch({type:ACTIONS.LOGOUT});
      }
    )
  }
}

export const toggleOverlay = (overlay) => {
  return {type:ACTIONS.TOGGLE_OVERLAY, payload:overlay}
}

export const getWelcome = () => {
  return (dispatch) => {
    dispatch({type:ACTIONS.HOME_LOADING})
    httpClient.get(URLS.welcome).then(
      (response) => {
        if (response.data.error){
          AsyncStorage.removeItem('data').then(
            () => {
              dispatch({type:ACTIONS.LOGOUT});
              Actions.replace("login_main");logEvent(LOG_EVENT.SCREEN_CHANGE, 'login_main');
            }
          )
        }
        else{
          dispatch({type:ACTIONS.WELCOME, payload: response.data})
        }
      }
    ).catch(
      (e) => {console.log('error is: ', e);dispatch({type:ACTIONS.HOME_ERROR, payload: "Sorry, could not connect to the server!"})}
    )
  }      
};

export const changeSelectedCategory = (selected_category) => {
  return {type:ACTIONS.HOME_CHANGE_CATEGORY, payload: selected_category}
}

export const sendFavouriteCategory = (selected_category) => {
  httpClient.post(URLS.setcategory, {fav_category: selected_category})
  return {type:null}
}

export const showRealApp = () => {
  return {type:ACTIONS.HOME_SHOW_REAL_APP}
}