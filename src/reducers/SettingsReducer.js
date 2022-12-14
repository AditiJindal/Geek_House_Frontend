import {ACTIONS} from '../actions/types';

const INITIAL_STATE = {
  loading: true,
  settingsData: {},
  fav_category: '',
  gotSettingsData: false,
  profile_pic_loading: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.GET_SETTINGS_DATA:
      return {
        ...state,
        loading: false,
        settingsData: action.payload,
        fav_category: action.payload.fav_category,
        gotSettingsData: true,
      };

    case ACTIONS.CHAT_SOCKET_CHANGE_CATEGORY:
      return {...state, fav_category: action.payload};

    case ACTIONS.SETTINGS_LOADING:
      return {...state, loading: true};

    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE};

    case ACTIONS.SETTINGS_CHANGE_PROFILE_IMAGE_LOADING:
      return {...state, profile_pic_loading: action.payload};

    default:
      return state;
  }
};
