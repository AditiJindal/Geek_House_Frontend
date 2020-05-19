import {ACTIONS} from '../actions/types';

const INITIAL_STATE = {
  articles: [],
  selectedArticleInfo: {},
  loading: false,
  bookmarked_articles: {},
  bookmarks_loading: false,
  bookmarks_error: false,
};

const insertCommentInArticle = (article, new_comment) => {
  const {comments} = article;
  let commentFound = false;
  let new_comments = [];

  comments.map(comment => {
    if (comment._id.toString() === new_comment._id.toString()) {
      new_comment.comment = new_comment.comment || comment.comment;
      new_comment.rating = new_comment.rating || comment.rating;
      new_comments.push(new_comment);
      commentFound = true;
    } else {
      new_comments.push(comment);
    }
  });

  if (!commentFound) {
    new_comments.unshift(new_comment);
  }
  article.comments = new_comments;
  return {...article};
};

export default (state = INITIAL_STATE, action) => {
  let new_state, new_selectedArticleInfo;

  switch (action.type) {
    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE};

    case ACTIONS.ARTICLE_INFO_LOADING:
      return {...state, loading: true};

    case ACTIONS.GET_ARTICLE_INFO:
      let new_articles = [...state.articles];
      if (action.payload.forceUpdate) {
        new_articles = state.articles.map(article => {
          if (article.article_id.to === action.payload.article_id) {
            return action.payload.article;
          } else {
            return article;
          }
        });
      } else if (action.payload.add) {
        new_articles.push(action.payload.article);
      }
      new_state = {
        ...state,
        articles: new_articles,
        selectedArticleInfo: action.payload.article,
        loading: false,
      };
      return new_state;

    case ACTIONS.ARTICLE_ADD_COMMENT:
      new_selectedArticleInfo = insertCommentInArticle(
        state.selectedArticleInfo,
        action.payload,
      );
      new_state = {...state, selectedArticleInfo: new_selectedArticleInfo};
      return new_state;

    case ACTIONS.ARTICLE_BOOKMARK:
      selectedArticleInfo = {...state.selectedArticleInfo};
      selectedArticleInfo.bookmarked = action.payload.bookmarked;

      new_articles = state.articles.map(article => {
        if (article.article_id.toString() === action.payload.article_id) {
          article.bookmarked = action.payload.bookmarked;
          return article;
        } else {
          return article;
        }
      });

      new_state = {...state, selectedArticleInfo, articles: new_articles};
      return new_state;

    case ACTIONS.BOOKMARKS_LOADING:
      return {...state, bookmarks_loading: true};

    case ACTIONS.BOOKMARKS_ERROR:
      return {...state, bookmarks_error: action.payload};

    case ACTIONS.PUBLISH_SUCCESS:
      state.articles = state.articles.map(article => {
        if (article.article_id === action.payload.article_id) {
          article.category = action.payload.category;
          article.contents = action.payload.contents;
          article.image = action.payload.image;
          article.topic = action.payload.topic;
        }
        return article;
      });
      return {...state, articles: [...state.articles]};

    case ACTIONS.GET_BOOKMARKS:
      return {
        ...state,
        bookmarked_articles: action.payload,
        bookmarks_loading: false,
        bookmarks_error: false,
      };

    default:
      return state;
  }
};
