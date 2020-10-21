import {storageSetItem} from '../utilities/storage';
import {ACTIONS} from '../actions/types';

const INITIAL_STATE = {
  data: {},
  nameCopy: '',
  googleLoading: false,
  facebookLoading: false,
  loading: true,
  authtoken: '',
  policy: null,
  policyLoading: true,
  internetReachable: false,
};

const saveLoginData = (state) => {
  // {data:new_data, authtoken:authtoken,
  //   categories:response.data.categories}
  const final_data = {
    data: state.data,
    authtoken: state.authtoken,
  };

  storageSetItem('LOGIN REDUCER 1', 'data', final_data);
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOGOUT:
      return {
        ...INITIAL_STATE,
        loading: false,
        internetReachable: state.internetReachable,
      };

    case ACTIONS.LOADING_FB:
      return {...state, facebookLoading: action.payload};

    case ACTIONS.LOADING_GOOGLE:
      return {...state, googleLoading: action.payload};

    case ACTIONS.CHECKING_LOGIN:
      return {...state, loading: true};

    case ACTIONS.LOGIN_DATA:
      return {
        ...state,
        data: action.payload.data,
        nameCopy: action.payload.data.name,
        authtoken: action.payload.authtoken,
      };

    case ACTIONS.LOGIN_POLICY:
      return {
        ...state,
        policy: {
          cards: action.payload.cards,
          links: action.payload.links,
        },
        policyLoading: false,
      };

    case ACTIONS.LOGIN_INTERNET_REACHABLE:
      return {...state, internetReachable: action.payload};

    case ACTIONS.SETTINGS_CHANGE_NAME:
      let data = {...state.data, name: action.payload.name};
      new_state = {...state, data};

      if (action.payload.confirmChange) {
        new_state.nameCopy = action.payload.name;
        saveLoginData(new_state);
      }
      if (action.payload.revertName) {
        new_state.data.name = state.nameCopy;
      }
      return new_state;

    case ACTIONS.SETTINGS_CHANGE_PROFILE_IMAGE:
      new_state = {...state, data: {...state.data, ...action.payload}};
      saveLoginData(new_state);
      return new_state;

    default:
      return state;
  }
};
