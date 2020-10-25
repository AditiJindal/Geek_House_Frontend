import {createStore, applyMiddleware} from 'redux';
import {combineReducers} from 'redux';

import middleware from './middleware';
import LoginReducer from '../reducers/LoginReducer';
import HomeReducer from '../reducers/HomeReducer';
import SearchReducer from '../reducers/SearchReducer';
import ArticleInfoReducer from '../reducers/ArticleInfoReducer';
import WriteReducer from '../reducers/WriteReducer';
import ChatReducer from '../reducers/ChatReducer';
import SettingsReducer from '../reducers/SettingsReducer';

const reducers = combineReducers({
  login: LoginReducer,
  home: HomeReducer,
  search: SearchReducer,
  articleInfo: ArticleInfoReducer,
  write: WriteReducer,
  chat: ChatReducer,
  settings: SettingsReducer,
});

export const store = createStore(reducers, {}, applyMiddleware(...middleware));
