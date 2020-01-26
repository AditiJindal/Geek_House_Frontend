import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT, LOG_EVENT} from '../Constants';
import {OVERLAY_COLOR} from '../Constants';
import {logEvent} from './ChatAction';
import axios from 'axios';
import {encrypt} from '../encryptionUtil';

// Bullshit to do in evey file ->
const httpClient = axios.create();

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = encrypt(state.login.authtoken);
    dispatch({type:null})
  }
}
// till here


export const getPopularSearches = () => {
  return (dispatch) => {
    dispatch({type:ACTIONS.SEARCH_LOADING})
    httpClient.get(URLS.popularsearches).then((response) => {
      dispatch({type:ACTIONS.POPULAR_SEARCHES_SUCCESS, payload:response.data})
    }).catch(() => {
      logEvent(LOG_EVENT, {errorLine: 'SEARCH ACTION - 31', description:e.toString()})
      showAlert(true, {})})
  }
}

export const updateSearchValue = (search) => {
  return {type:ACTIONS.SEARCH_UPDATE, payload:search}
}

export const selectCategory = (category) => {
  return {type:ACTIONS.SEARCH_SELECT_CATEGORY, payload:category}
}

export const doSearch = (search, category) => {

  return (dispatch) => {
    dispatch({type:ACTIONS.DOING_SEARCH_LOADING})
    httpClient.post(URLS.search, {search, category}).then(
      (response) => {
        dispatch({type:ACTIONS.DO_SEARCH, payload:response.data})
      }
    ).catch(e=>logEvent(LOG_EVENT, {errorLine: 'SEARCH ACTION - 452', description:e.toString()}))
  }
}

export const clearSearch = () => {
  return {type:ACTIONS.CLEAR_SEARCH}
}

export const showAlert = (alertVisible, alertMessage) => {
  let statusBarColor = "#FFFFFF"
  if (alertVisible){
    statusBarColor = OVERLAY_COLOR
  }
  return {type: ACTIONS.SHOW_SEARCH_ALERT, payload:{alertVisible, alertMessage, statusBarColor}}
}