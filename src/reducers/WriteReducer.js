import {ACTIONS} from '../actions/types';

const INITIAL_STATE = {
  loading: false,
  myArticles: [],
  contents: [], // was earlier set to false
  topic: '',
  category: '',
  reload: false,
  image: false,
  published: false,
  alertVisible: false,
  alertMessage: {},
  isDraft: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE};

    case ACTIONS.WRITE_LOADING:
      return {...state, loading: true};

    case ACTIONS.GET_MY_ARTICLES:
      return {
        ...state,
        loading: false,
        myArticles: action.payload,
        reload: false,
      };

    case ACTIONS.SET_CONTENTS:
      return {
        ...state,
        contents: action.payload.contents,
        topic: action.payload.topic,
        category: action.payload.category,
      };

    case ACTIONS.SET_IMAGE:
      return {...state, image: action.payload};

    case ACTIONS.PUBLISH_SUCCESS:
      if (state.myArticles[action.payload.category]) {
        state.myArticles[action.payload.category].unshift(action.payload);
      } else {
        state.myArticles[action.payload.category] = [action.payload];
      }

      return {
        ...state,
        published: true,
        loading: false,
        isDraft: false,
        reload: true,
        myArticles: {...state.myArticles},
      };

    case ACTIONS.CLEAR_WRITE:
      return {
        ...state,
        loading: false,
        contents: [],
        category: '',
        topic: '',
        image: false,
        published: false,
        isDraft: false,
      };

    case ACTIONS.WRITE_SHOW_ALERT:
      return {
        ...state,
        alertVisible: action.payload.alertVisible,
        alertMessage: action.payload.alertMessage,
      };

    case ACTIONS.WRITE_SET_DRAFT:
      return {...state, isDraft: true};

    default:
      return state;
  }
};
