import remoteConfig from '@react-native-firebase/remote-config';
import {REMOTE_CONFIG_PARAMS} from '../Constants';

export const remoteConfigSetup = async () => {
  await remoteConfig().setDefaults(REMOTE_CONFIG_PARAMS);
  await remoteConfig().fetchAndActivate();
};

export const getRemoteParam = (param) => {
  return JSON.parse(remoteConfig().getString(param)).data;
};
