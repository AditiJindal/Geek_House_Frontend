import {ACTIONS} from './types';
import {URLS, COLORS_LIGHT_THEME} from '../Constants';
import {httpClient} from '../utilities';

export const getPopularSearches = (onSuccess) => {
  return (dispatch) => {
    dispatch({type: ACTIONS.SEARCH_LOADING});
    httpClient()
      .get(URLS.popularsearches)
      .then(({data}) => {
        dispatch({type: ACTIONS.POPULAR_SEARCHES_SUCCESS, payload: data});
        onSuccess();
      })
      .catch(() => {
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
    httpClient()
      .post(URLS.search, {search, category})
      .then(({data}) => {
        dispatch({type: ACTIONS.DO_SEARCH, payload: data});
      });
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
