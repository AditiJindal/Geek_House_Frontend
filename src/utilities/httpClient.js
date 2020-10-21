import axios from 'axios';

import {encrypt} from './encryption';
import {store} from '../reducers';
import {HTTP_TIMEOUT, BASE_URL} from '../Constants';

const instance = axios.create({timeout: HTTP_TIMEOUT, baseURL: BASE_URL});

const httpClient = () => {
  const {authtoken} = store.getState().login;
  instance.defaults.headers.common['Authorization'] = encrypt(authtoken);
  return instance;
};

export {httpClient};
