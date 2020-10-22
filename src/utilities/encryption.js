import {KEYCODE} from '../Constants';
import CryptoJS from 'crypto-js';

export const encrypt = (text) => {
  if (__DEV__) {
    return text;
  } // disable encryption in dev
  try {
    const enc = CryptoJS.AES.encrypt(text, KEYCODE).toString();
    return enc;
  } catch {
    return null;
  }
};

export const decrypt = (cipherText) => {
  if (__DEV__) {
    return cipherText;
  } // disable decryption in dev
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, KEYCODE);
    const dec = bytes.toString(CryptoJS.enc.Utf8);
    return dec;
  } catch {
    return null;
  }
};
