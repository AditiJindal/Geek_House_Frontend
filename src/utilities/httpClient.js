import axios from 'axios';
import {HTTP_TIMEOUT, BASE_URL} from '../Constants';

const httpClient = axios.create({timeout: HTTP_TIMEOUT, baseURL: BASE_URL});
axios.interceptors.response.use(
  async (response) => {
    const {httpMetric} = response.config.metadata;
    httpMetric.setHttpResponseCode(response.status);
    httpMetric.setResponseContentType(response.headers['content-type']);
    await httpMetric.stop();
    return response;
  },
  async (error) => {
    const {httpMetric} = error.config.metadata;
    httpMetric.setHttpResponseCode(error.response.status);
    httpMetric.setResponseContentType(error.response.headers['content-type']);
    await httpMetric.stop();
    return Promise.reject(error);
  },
);

export {httpClient};
