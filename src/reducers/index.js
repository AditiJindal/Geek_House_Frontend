import { combineReducers } from 'redux';
import LoginReducer from '../reducers/LoginReducer';
import HomeReducer from '../reducers/HomeReducer';
import SearchReducer from '../reducers/SearchReducer';
import ArticleInfoReducer from '../reducers/ArticleInfoReducer';
import WriteReducer from '../reducers/WriteReducer';
import ChatReducer from '../reducers/ChatReducer';
import SettingsReducer from '../reducers/SettingsReducer';

export default combineReducers({
    login: LoginReducer,
    home: HomeReducer,
    search: SearchReducer,
    articleInfo: ArticleInfoReducer,
    write: WriteReducer,
    chat: ChatReducer,
    settings: SettingsReducer
});
