import {ACTIONS} from '../actions/types';

const INITIAL_STATE = {
  popularSearchesData: null,
  loading: true,
  searchValue: '',
  categorySelected: 'All Categories',
  searchResults: false,
  showPopularSearches: true,
  alertVisible: false,
  alertMessage: {},
  statusBarColor: '#FFFFFF',
  doingSearch: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE};

    case ACTIONS.DOING_SEARCH_LOADING:
      return {...state, loading: true, doingSearch: true};

    case ACTIONS.SEARCH_LOADING:
      return {...state, loading: true};

    case ACTIONS.POPULAR_SEARCHES_SUCCESS:
      return {...state, loading: false, popularSearchesData: action.payload};

    case ACTIONS.SHOW_SEARCH_ALERT:
      return {
        ...state,
        statusBarColor: action.payload.statusBarColor,
        alertMessage: action.payload.alertMessage,
        alertVisible: action.payload.alertVisible,
      };

    case ACTIONS.SEARCH_UPDATE:
      return {...state, searchValue: action.payload};

    case ACTIONS.SEARCH_SELECT_CATEGORY:
      return {...state, categorySelected: action.payload};

    case ACTIONS.DO_SEARCH:
      return {
        ...state,
        searchResults: action.payload,
        showPopularSearches: false,
        loading: false,
        doingSearch: false,
        categoryInfo: action.payload.categoryInfo,
      };

    case ACTIONS.CLEAR_SEARCH:
      return {...state, searchResults: false, searchValue: ''};

    default:
      return state;
  }
};
