import {ACTIONS} from './types';
import {URLS} from '../Constants';
import {httpClient} from '../utilities';

const articleHandler = (
  dispatch,
  getState,
  article_id,
  preview_article,
  forceUpdate,
) => {
  const state = getState();
  let articles = state.articleInfo.articles;
  let found = false;
  if (preview_article) {
    dispatch({
      type: ACTIONS.GET_ARTICLE_INFO,
      payload: {article: preview_article, add: false},
    });
  } else {
    dispatch({type: ACTIONS.ARTICLE_INFO_LOADING});
    if (!forceUpdate) {
      articles.map((article) => {
        if (article.article_id === article_id) {
          found = true;
          dispatch({
            type: ACTIONS.GET_ARTICLE_INFO,
            payload: {article, add: false, forceUpdate: false},
          });
        }
      });
    }
    if (!found) {
      httpClient()
        .post(URLS.articleinfo, {article_id: article_id})
        .then((response) => {
          dispatch({
            type: ACTIONS.GET_ARTICLE_INFO,
            payload: {article: response.data, add: true, forceUpdate},
          });
        });
    }
  }
};

export const getArticleInfo = (article_id, preview_article, forceUpdate) => {
  return (dispatch, getState) => {
    articleHandler(
      dispatch,
      getState,
      article_id,
      preview_article,
      forceUpdate,
    );
  };
};

export const resetSelectedArticleInfo = () => ({
  type: ACTIONS.RESET_SELECTED_ARTICLE_INFO,
});

export const submitComment = (to_send, author, author_image) => {
  return (dispatch) => {
    if (to_send.rating < 0) {
      to_send.rating = 0;
    }

    httpClient()
      .post(URLS.comment, to_send)
      .then(({data}) => {
        dispatch({
          type: ACTIONS.ARTICLE_ADD_COMMENT,
          payload: {...to_send, _id: data.comment_id, author, author_image},
        });
      });
  };
};

export const bookmarkArticle = (article_id, bookmarked) => {
  return (dispatch) => {
    httpClient()
      .post(URLS.bookmark_article, {article_id, add: !bookmarked})
      .then(() => {
        dispatch({
          type: ACTIONS.ARTICLE_BOOKMARK,
          payload: {article_id, bookmarked: !bookmarked},
        });
      });
  };
};

export const getBookmarkedArticles = () => {
  return (dispatch) => {
    dispatch({type: ACTIONS.BOOKMARKS_LOADING});
    httpClient()
      .get(URLS.get_bookmarked_articles)
      .then((response) => {
        dispatch({type: ACTIONS.GET_BOOKMARKS, payload: response.data});
      })
      .catch((e) => {
        dispatch({
          type: ACTIONS.BOOKMARKS_ERROR,
          payload: "Couldn't get your bookmarked articles",
        });
      });
  };
};
