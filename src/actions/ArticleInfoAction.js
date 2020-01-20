import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT} from '../Constants';
import axios from 'axios';
import crashlytics from '@react-native-firebase/crashlytics';


// Bullshit to do in evey file ->
const httpClient = axios.create();

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = state.login.authtoken;
    dispatch({type:null})
  }
}

// till here

const articleHandler = (dispatch, getState, article_id, preview_article, forceUpdate) => {
  const state = getState();
  let articles = state.articleInfo.articles;
  let found = false
  if (preview_article){
    dispatch({type:ACTIONS.GET_ARTICLE_INFO, payload:{article:preview_article, add:false}})      
  }
  else{
    dispatch({type:ACTIONS.ARTICLE_INFO_LOADING})
    if (!forceUpdate){
      articles.map((article) => {
        if (article.article_id===article_id){
          found = true;
          dispatch({type:ACTIONS.GET_ARTICLE_INFO, payload:{article, add:false, forceUpdate:false}})
        }      
      });
    }
    if (!found){
      httpClient.post(URLS.articleinfo,{article_id:article_id}).then(
        (response) => {
          dispatch({type:ACTIONS.GET_ARTICLE_INFO, payload:{article:response.data, add:true, forceUpdate}})
        }
      ).catch(e=>crashlytics().log("ArticleInfoAction LINE 45"+e.toString()))
      }
    }
  
}

export const getArticleInfo = (article_id, preview_article, forceUpdate) => {
  return (dispatch, getState)=>{articleHandler(dispatch, getState, article_id, preview_article, forceUpdate)}
}

export const submitComment = (to_send) => {
  return (dispatch, getState) => {
    if (to_send.rating<0){to_send.rating=0}
    httpClient.post(URLS.comment, to_send).then((response) => {
      // dispatch({type:ACTIONS.ARTICLE_ADD_COMMENT, payload:to_send});
      articleHandler(dispatch, getState, to_send.article_id, false, true)
    }).catch(e=>crashlytics().log("ArticleInfoAction LINE 60"+e.toString()))
  }
}

export const bookmarkArticle = (article_id, bookmarked) => {
  return (dispatch)=>{
    httpClient.post(URLS.bookmark_article, {article_id, add:!bookmarked}).then(()=>{
      dispatch({type:ACTIONS.ARTICLE_BOOKMARK, payload:{article_id, bookmarked: !bookmarked}})
    })
  }
}

export const getBookmarkedArticles = () => {
  console.log('In Get bookmarks ')
  return (dispatch) => {
    dispatch({type:ACTIONS.BOOKMARKS_LOADING});
    httpClient.get(URLS.get_bookmarked_articles).then((response) => {
      console.log('Dispatched data: ', response.data)
      dispatch({type:ACTIONS.GET_BOOKMARKS, payload:response.data})
    }).catch(()=>{dispatch({type:ACTIONS.BOOKMARKS_ERROR, payload:"Couldn't get your bookmarked articles"})})
  }
}