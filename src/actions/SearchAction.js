import {ACTIONS} from './types';
import {URLS, LOG_EVENT, COLORS_LIGHT_THEME} from '../Constants';
import {logEvent} from './ChatAction';
import analytics from '@react-native-firebase/analytics';
import {httpClient, encrypt} from '../utilities';

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = encrypt(
      state.login.authtoken,
    );
    dispatch({type: null});
  };
};
// till here

export const getPopularSearches = () => {
  return (dispatch) => {
    dispatch({type: ACTIONS.SEARCH_LOADING});
    httpClient
      .get(URLS.popularsearches)
      .then(({data}) => {
        dispatch({type: ACTIONS.POPULAR_SEARCHES_SUCCESS, payload: data});
      })
      .catch(() => {
        logEvent(LOG_EVENT.ERROR, {
          errorLine: 'SEARCH ACTION - 31',
          description: e.toString(),
        });
        showAlert(true, {});
      });
  };
};

export const updateSearchValue = (search) => {
  return {type: ACTIONS.SEARCH_UPDATE, payload: search};
};

export const selectCategory = (category) => {
  return {type: ACTIONS.SEARCH_SELECT_CATEGORY, payload: category};
};

export const doSearch = (search, category) => {
  return (dispatch) => {
    dispatch({type: ACTIONS.DOING_SEARCH_LOADING});
    analytics().logSearch({search_term: search});
    httpClient
      .post(URLS.search, {search, category})
      .then(({data}) => {
        dispatch({type: ACTIONS.DO_SEARCH, payload: data});
      })
      .catch((e) =>
        logEvent(LOG_EVENT.ERROR, {
          errorLine: 'SEARCH ACTION - 452',
          description: e.toString(),
        }),
      );
  };
};

export const clearSearch = () => {
  return {type: ACTIONS.CLEAR_SEARCH};
};

export const showAlert = (alertVisible, alertMessage) => {
  let statusBarColor = COLORS_LIGHT_THEME.LIGHT;
  return {
    type: ACTIONS.SHOW_SEARCH_ALERT,
    payload: {alertVisible, alertMessage, statusBarColor},
  };
};
