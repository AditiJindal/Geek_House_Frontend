import {ACTIONS} from '../actions/types';

const INITIAL_STATE = {
  welcomeData: {notifications: []},
  loading: true,
  error: '',
  selected_category: '',
  image_adder: '',

  exploreLoading: true,
  exploreCategory: null,
  exploreData: {},
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE};

    case ACTIONS.WELCOME:
      const {image_adder} = action.payload;

      return {
        ...state,
        welcomeData: action.payload,
        loading: false,
        error: '',
        image_adder,
      };

    case ACTIONS.HOME_ERROR:
      return {...state, error: action.payload, loading: false};

    case ACTIONS.HOME_LOADING:
      return {...state, loading: true, error: ''};

    case ACTIONS.CHAT_SOCKET_CHANGE_CATEGORY:
      return {...state, selected_category: action.payload};

    case ACTIONS.EXPLORE_SEARCH_LOADING:
      return {...state, exploreLoading: true};

    case ACTIONS.EXPLORE_SEARCH:
      return {
        ...state,
        exploreData: action.payload.data,
        exploreCategory: action.payload.exploreCategory,
        exploreLoading: false,
      };

    default:
      return state;
  }
};
