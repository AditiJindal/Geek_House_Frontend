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
  editing_article_id: null,
};

export default (state = INITIAL_STATE, action) => {
  let new_state = {};

  switch (action.type) {
    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE};

    case ACTIONS.WRITE_LOADING:
      return {...state, loading: action.payload};

    case ACTIONS.GET_MY_ARTICLES:
      return {
        ...state,
        loading: false,
        myArticles: action.payload,
        reload: false,
      };

    case ACTIONS.SET_CONTENTS:
      new_state = {
        ...state,
        contents: action.payload.contents,
        topic: action.payload.topic,
        category: action.payload.category,
        editing_article_id: action.payload.article_id,
      };
      return new_state;

    case ACTIONS.SET_IMAGE:
      return {...state, image: action.payload};

    case ACTIONS.PUBLISH_SUCCESS:
      if (action.payload.edited) {
        state.myArticles[action.payload.category] = state.myArticles[
          action.payload.category
        ].map(article => {
          if (article.article_id === action.payload.article_id) {
            return action.payload;
          } else {
            return article;
          }
        });
      } else if (state.myArticles[action.payload.category]) {
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
        editing_article_id: null,
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
        article_id: null,
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
