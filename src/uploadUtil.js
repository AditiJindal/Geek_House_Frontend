import uuid from 'uuid/v4';
import {BASE_URL, URLS} from './Constants';


const createFormData = ({image_url, mimeType, extension}) => {
  const data = new FormData();
  const fileName = `${uuid()}.${extension}`

  data.append("file", {
    name: fileName,
    type: mimeType,
    uri: image_url,
  });

  return data;
};

const getFileMetadata = ({type, extension}) => {
  const fileName = `${uuid()}.${extension}`
  const uploadType = type
  return {fileName, uploadType}
}

export const handleUpload = async (data) => {
  // {type:'profile_picture', mimeType:'image/jpeg', image_url, extension:'jpeg', authToken}
  const image_url = fetch(BASE_URL + URLS.upload_server, {
    method: "post",
    headers: {
      authorization:data.authToken,
      filemetadata: JSON.stringify(getFileMetadata(data))
    },
    body: createFormData(data)
  });
  return image_url
};