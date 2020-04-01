import {ACTIONS} from './types';
import {URLS, BASE_URL, HTTP_TIMEOUT, LOG_EVENT} from '../Constants';
import axios from 'axios';
import {logEvent} from './ChatAction';
import {encrypt, decrypt} from '../encryptionUtil';

// Bullshit to do in evey file ->
const httpClient = axios.create();

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = encrypt(state.login.authtoken);
    dispatch({type:null})
  }
}
// till here

export const getMyArticles = (myArticlesLength, reload) => {
  if (myArticlesLength===0 || reload){
    return (dispatch) => {
      dispatch({type:ACTIONS.WRITE_LOADING});
      httpClient.get(URLS.myarticles).then(
        ({data})=>{
          dispatch({type:ACTIONS.GET_MY_ARTICLES,
          payload:data})
        }
      ).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'WRITE ACTION - 32', description:e.toString()}))
    }
  }
  else{
    return {type:null}
  }
  
  
}

export const setContents = (contents, topic, category) => {
  return {type:ACTIONS.SET_CONTENTS, payload:{contents, topic, category}}
}

export const setImage = (image) => {
  return {type:ACTIONS.SET_IMAGE, payload:image}
}

export const uploadImage = async (resourceData, file) => {
  return new Promise((resolver, rejecter) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      if (xhr.status < 400) {
        resolver(true)
      } else {
        const error = new Error(xhr.response);
        rejecter(error)
      }
    };
    xhr.onerror = (error) => {
      rejecter(error)
    };

    xhr.open('PUT', resourceData.uploadUrl);
    xhr.setRequestHeader('Content-Type', resourceData.contentType);
    xhr.send({ uri: file });
  })
}

export const uploadArticleImages = async (article) => {
  let promises = []
  let contents = article.contents
  let new_contents = []
  let i, card, response, preSignedURL, pathToImage, promise;

  for (i=0; i<contents.length; i++){
    card = contents[i];
    if (!card.image){
      new_contents.push(card)
    }
    else{
      response = await httpClient.get(URLS.imageupload, 
        {params:{type:'article', image_type:'jpeg'}})
      preSignedURL = decrypt(response.data.url)
      pathToImage = card.image.uri
      card.image.uri = decrypt(response.data.key)
      promise = uploadImage({contentType: "image/jpeg", uploadUrl: preSignedURL}, pathToImage);
      promises.push(promise);
      new_contents.push(card)
    }
  }

  await Promise.all(promises)

  article.contents = new_contents;
  return article
}

export const publishArticle = (article, success_animation) => {
  return (dispatch) => {
    dispatch({type:ACTIONS.WRITE_LOADING})

    if (article.image){
      httpClient.get(URLS.imageupload, {params:{type:'article', image_type:'jpeg'}}).then((response)=>{
        const preSignedURL = decrypt(response.data.url)
        const pathToImage = article.image
        uploadImage({contentType: "image/jpeg", uploadUrl: preSignedURL}, pathToImage)    
          .then(() => {
            article.image = decrypt(response.data.key)
            httpClient.post(URLS.publish, article).then(
              ({data}) => {
                dispatch({type:ACTIONS.PUBLISH_SUCCESS, payload:{...article, ...data}});
              }
            );
          }).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'WRITE ACTION - 88', description:e.toString()}))
        }).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'WRITE ACTION - 89', description:e.toString()}))
      }
    else{
      httpClient.post(URLS.publish, article).then(
        ({data}) => {
          dispatch({type:ACTIONS.PUBLISH_SUCCESS, payload:{...article, ...data}});
          success_animation.play()
        }
      ).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'WRITE ACTION - 97', description:e.toString()}))
    }
    };
  }


export const clearPublish = () => {
  return {type:ACTIONS.CLEAR_WRITE}
}

export const showAlert = (alertVisible, alertMessage) => {
  return {type: ACTIONS.WRITE_SHOW_ALERT, payload:{alertVisible, alertMessage}}
}

export const setDraft = () => {
  return {type: ACTIONS.WRITE_SET_DRAFT}
}