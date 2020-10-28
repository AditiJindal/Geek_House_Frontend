import AsyncStorage from '@react-native-community/async-storage';

export const storageGetItem = async (key) => {
  const response = await AsyncStorage.getItem(key);
  const value = JSON.parse(response);
  return value;
};

export const storageSetItem = async (key, value) => {
  const response = await AsyncStorage.setItem(key, JSON.stringify(value));
  return response;
};

export const storageRemoveItem = async (key) => {
  const response = await AsyncStorage.removeItem(key);
  return response;
};
