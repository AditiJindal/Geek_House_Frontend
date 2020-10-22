import uuid from 'uuid-random';

import {decrypt} from './encryption';
import {httpClient} from './httpClient';
import {store} from '../reducers';
import {BASE_URL, URLS} from '../Constants';

const {getState} = store;

const createFormData = ({image_url, mimeType, extension}) => {
  const data = new FormData();
  const fileName = `${uuid()}.${extension}`;

  data.append('file', {
    name: fileName,
    type: mimeType,
    uri: image_url,
  });

  return data;
};

const getFileMetadata = ({type, extension}) => {
  const fileName = `${uuid()}.${extension}`;
  const uploadType = type;
  return {fileName, uploadType};
};

const getBlob = async (file) => {
  const response = await fetch(file);
  const image = await response.blob();
  return image;
};

const uploadImageHelper = async (resourceData, file) => {
  const image = await getBlob(file);

  return fetch(resourceData.uploadUrl, {
    method: 'PUT',
    body: image,
  });
};

export const uploadImage = async (local_image_uri, {type, image_type}) => {
  // takes local_image_uri and returns aws image uri
  // type eg. 'group_icon', image_type: eg. 'jpeg'
  try {
    const response = await httpClient().get(URLS.imageupload, {
      params: {type, image_type},
    });
    const preSignedURL = decrypt(response.data.url);
    await uploadImageHelper(
      {contentType: 'image/jpeg', uploadUrl: preSignedURL},
      local_image_uri,
    );
    return decrypt(response.data.key);
  } catch (e) {
    return {error: e};
  }
};

export const uploadImageServer = async (data) => {
  const {authtoken} = getState().login;
  if (!data.shouldUpload) {
    return data.image_url;
  }
  // {type:'profile_picture', mimeType:'image/jpeg', image_url, extension:'jpeg'}
  const response = await fetch(BASE_URL + URLS.upload_server, {
    method: 'post',
    headers: {
      authorization: authtoken,
      filemetadata: JSON.stringify(getFileMetadata(data)),
    },
    body: createFormData(data),
  });
  const json = await response.json();
  return json.image_url;
};
