import {ACTIONS} from './types';
import {URLS, LOG_EVENT} from '../Constants';
import {logEvent} from './ChatAction';
import {decrypt, httpClient, uploadImage} from '../utilities';

export const getMyArticles = (myArticlesLength, reload) => {
  if (myArticlesLength === 0 || reload) {
    return (dispatch) => {
      dispatch({type: ACTIONS.WRITE_LOADING, payload: true});
      httpClient()
        .get(URLS.myarticles)
        .then(({data}) => {
          dispatch({type: ACTIONS.GET_MY_ARTICLES, payload: data});
        })
        .catch((e) =>
          logEvent(LOG_EVENT.ERROR, {
            errorLine: 'WRITE ACTION - 32',
            description: e.toString(),
          }),
        );
    };
  } else {
    return {type: null};
  }
};

export const setContents = (contents, topic, category, article_id = null) => {
  return {
    type: ACTIONS.SET_CONTENTS,
    payload: {contents, topic, category, article_id},
  };
};

export const setImage = (image) => {
  return {type: ACTIONS.SET_IMAGE, payload: image};
};

export const uploadArticleImages = async (article) => {
  const {contents} = article;
  const new_contents = [];

  for (let i = 0; i < contents.length; i++) {
    const card = contents[i];
    if (card.image) {
      card.image.uri = await uploadImage(card.image.uri, {
        type: 'article',
        image_type: 'jpeg',
      });
    }
    new_contents.push(card);
  }

  article.contents = new_contents;
  return article;
};

export const publishArticle = (
  article,
  success_animation,
  editing_article_id = null,
) => {
  return (dispatch) => {
    dispatch({type: ACTIONS.WRITE_LOADING, payload: true});

    if (article.image && article.image.substring(0, 4) === 'file') {
      uploadImage(article.image, {type: 'article', image_type: 'jpeg'})
        .then((image) => {
          httpClient()
            .post(URLS.publish, {...article, editing_article_id, image})
            .then(({data}) => {
              success_animation.play();
              dispatch({
                type: ACTIONS.PUBLISH_SUCCESS,
                payload: {...article, ...data},
              });
            });
        })
        .catch((e) =>
          logEvent(LOG_EVENT.ERROR, {
            errorLine: 'WRITE ACTION - 89',
            description: e.toString(),
          }),
        );
    } else {
      httpClient()
        .post(URLS.publish, {...article, editing_article_id})
        .then(({data}) => {
          success_animation.play();
          dispatch({
            type: ACTIONS.PUBLISH_SUCCESS,
            payload: {...article, ...data},
          });
        })
        .catch((e) => {
          logEvent(LOG_EVENT.ERROR, {
            errorLine: 'WRITE ACTION - 97',
            description: e.toString(),
          });
        });
    }
  };
};

export const clearPublish = () => {
  return {type: ACTIONS.CLEAR_WRITE};
};

export const showAlert = (alertVisible, alertMessage) => {
  return {
    type: ACTIONS.WRITE_SHOW_ALERT,
    payload: {alertVisible, alertMessage},
  };
};

export const setDraft = () => {
  return {type: ACTIONS.WRITE_SET_DRAFT};
};
