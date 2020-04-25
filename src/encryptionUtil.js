import {KEYCODE} from './Constants';
import CryptoJS from 'crypto-js';

export const encrypt = text => {
  try {
    const enc = CryptoJS.AES.encrypt(text, KEYCODE).toString();
    return enc;
  } catch {
    return null;
  }
};

export const decrypt = ciphertext => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, KEYCODE);
    const dec = bytes.toString(CryptoJS.enc.Utf8);
    return dec;
  } catch {
    return null;
  }
};
