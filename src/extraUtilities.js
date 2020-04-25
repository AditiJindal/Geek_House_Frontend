import dynamicLinks from '@react-native-firebase/dynamic-links';
import queryString from 'query-string';
import {Actions} from 'react-native-router-flux';
import axios from 'axios';
import {HTTP_TIMEOUT, BASE_URL} from './Constants';
import perf from '@react-native-firebase/perf';

const httpClient = axios.create({timeout: HTTP_TIMEOUT, baseURL: BASE_URL});
axios.interceptors.response.use(
  async response => {
    const {httpMetric} = response.config.metadata;
    httpMetric.setHttpResponseCode(response.status);
    httpMetric.setResponseContentType(response.headers['content-type']);
    await httpMetric.stop();
    return response;
  },
  async error => {
    const {httpMetric} = error.config.metadata;
    httpMetric.setHttpResponseCode(error.response.status);
    httpMetric.setResponseContentType(error.response.headers['content-type']);
    await httpMetric.stop();
    return Promise.reject(error);
  },
);

export {httpClient};

export const getLevel = userXP => {
  if (!userXP) {
    return null;
  }
  let level = 0;
  let xpLeft = userXP;
  let levelXP = 0;
  while (true) {
    levelXP = Math.ceil(150 * level ** 1.5);
    xpLeft -= levelXP;
    if (xpLeft < 0) {
      break;
    }
    level++;
  }

  return {level, XPToLevelUp: -xpLeft, levelXP};
};

export const getDynamicLink = async () => {
  const response = await dynamicLinks().getInitialLink();
  if (response && response.url) {
    const result = queryString.parseUrl(response.url);
    const {query} = result;
    switch (query.type) {
      case 'article':
        Actions.jump('notification_article', {article_id: query.article_id});

      default:
        return null;
    }
  }
};
