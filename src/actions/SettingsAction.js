import {ACTIONS} from './types';
import {URLS} from '../Constants';
import uuid from 'uuid/v4';
import RNFileSystem from 'react-native-fs';
import {encrypt, decrypt} from '../encryptionUtil';
import {uploadImage} from './WriteAction';
import {httpClient} from '../extraUtilities';

var timer = null;

export const setAuthToken = () => {
  return (dispatch, getState) => {
    const state = getState();
    httpClient.defaults.headers.common['Authorization'] = encrypt(
      state.login.authtoken,
    );
  };
};
// till here

export const getSettingsData = reload => {
  return (dispatch, getState) => {
    const state = getState();

    if (reload || !state.settings.gotSettingsData) {
      httpClient
        .get(URLS.settings)
        .then(response => {
          dispatch({type: ACTIONS.GET_SETTINGS_DATA, payload: response.data});
        })
        .catch(e =>
          logEvent(LOG_EVENT.ERROR, {
            errorLine: 'SEARCH ACTION - 30',
            description: e.toString(),
          }),
        );
    }
  };
};

export const settingsChangeFavouriteCategory = selected_category => {
  return {
    type: ACTIONS.CHAT_SOCKET_CHANGE_CATEGORY,
    payload: selected_category,
  };
};

export const changeAnimationSettings = () => {
  return {type: ACTIONS.SETTINGS_CHANGE_ANIMATION};
};

export const changeQuickRepliesSettings = () => {
  return {type: ACTIONS.SETTINGS_CHANGE_QUICK_REPLIES};
};

export const changeTheme = value => {
  return {type: ACTIONS.CHANGE_THEME, payload: value};
};

export const changeChatWallpaper = (response, previous_image) => {
  return dispatch => {
    const target_path =
      RNFileSystem.ExternalStorageDirectoryPath +
      '/GeekHouse/' +
      `${uuid()}.jpg`;
    const target_path_url = `file://` + target_path;
    if (previous_image) {
      RNFileSystem.unlink(previous_image.substring(7)).catch(() => {});
    }
    RNFileSystem.copyFile(response.path, target_path).then(() => {
      dispatch({
        type: ACTIONS.CHANGE_CHAT_BACKGROUND,
        payload: target_path_url,
      });
    });
  };
};

export const changeBlurRadius = blur => {
  return {type: ACTIONS.CHANGE_CHAT_BACKGROUND_BLUR, payload: blur};
};

const nameValidator = name => {
  if (name.length < 2) {
    return {error: 'Name too short'};
  }
  if (name.includes('@')) {
    return {error: 'Name cannot contain @'};
  } else {
    return {error: false};
  }
};

export const changeName = name => {
  // this goes into LoginReducer as name remains with LoginReducer
  return {
    type: ACTIONS.SETTINGS_CHANGE_NAME,
    payload: {name, confirmChange: false},
  };
};

export const submitName = (name, callback) => {
  return dispatch => {
    const {error} = nameValidator(name);
    if (!error) {
      httpClient.post(URLS.change_name, {name}).then(() => {
        dispatch({
          type: ACTIONS.SETTINGS_CHANGE_NAME,
          payload: {name, confirmChange: true},
        });
        callback('Name changed successfully');
      });
    } else {
      callback(error);
    }
  };
};

export const revertName = () => {
  return {type: ACTIONS.SETTINGS_CHANGE_NAME, payload: {revertName: true}};
};

export const changeImageUrl = (image_url, callback) => {
  // this goes into LoginReducer as image_url remains with LoginReducer
  return dispatch => {
    dispatch({
      type: ACTIONS.SETTINGS_CHANGE_PROFILE_IMAGE_LOADING,
      payload: true,
    });
    httpClient
      .get(URLS.imageupload, {
        params: {type: 'profile_picture', image_type: 'jpeg'},
      })
      .then(response => {
        const preSignedURL = decrypt(response.data.url);

        uploadImage(
          {contentType: 'image/jpeg', uploadUrl: preSignedURL},
          image_url,
        )
          .then(() => {
            aws_image_url = decrypt(response.data.key);
            httpClient
              .post(URLS.change_profile_pic, {image_url: response.data.key}) // sending encrypted url
              .then(() => {
                // when everything is right, we change the image_url
                callback('Profile pic changed successfully');
                dispatch({
                  type: ACTIONS.SETTINGS_CHANGE_PROFILE_IMAGE,
                  payload: {image_url: aws_image_url},
                });
                dispatch({
                  type: ACTIONS.SETTINGS_CHANGE_PROFILE_IMAGE_LOADING,
                  payload: false,
                });
              })
              .catch(e => {
                callback('Not able to change profile pic');
                dispatch({
                  type: ACTIONS.SETTINGS_CHANGE_PROFILE_IMAGE_LOADING,
                  payload: false,
                });
              });
          })
          .catch(e => {
            callback("Couldn't change profile pic");
            dispatch({
              type: ACTIONS.SETTINGS_CHANGE_PROFILE_IMAGE_LOADING,
              payload: false,
            });
          });
      })
      .catch(e => {
        callback('Unable to change profile pic');
        dispatch({
          type: ACTIONS.SETTINGS_CHANGE_PROFILE_IMAGE_LOADING,
          payload: false,
        });
      });
  };
};
