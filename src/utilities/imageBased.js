import uuid from 'uuid-random';
import {BASE_URL, URLS} from '../Constants';

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

export const imageUploadServer = async (data) => {
  if (!data.shouldUpload) {
    return data.image_url;
  }
  // {type:'profile_picture', mimeType:'image/jpeg', image_url, extension:'jpeg', authToken}
  const response = await fetch(BASE_URL + URLS.upload_server, {
    method: 'post',
    headers: {
      authorization: data.authToken,
      filemetadata: JSON.stringify(getFileMetadata(data)),
    },
    body: createFormData(data),
  });
  const json = await response.json();
  return json.image_url;
};

export const uploadImage = async (resourceData, file) => {
  const image = await getBlob(file);

  return fetch(resourceData.uploadUrl, {
    method: 'PUT',
    body: image,
  });
};
