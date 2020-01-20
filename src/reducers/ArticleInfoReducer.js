import {ACTIONS} from '../actions/types';

const INITIAL_STATE = {
	articles: [],
	selectedArticleInfo: {},
	loading: false,
	bookmarked_articles: {},
	bookmarks_loading: false,
	bookmarks_error: false,
}

export default (state=INITIAL_STATE, action) => {
	
	switch (action.type){
		case ACTIONS.LOGOUT:
      return {...INITIAL_STATE}

    case ACTIONS.ARTICLE_INFO_LOADING:
      return {...state, loading:true}

		case ACTIONS.GET_ARTICLE_INFO:
			let new_articles=[...state.articles]
			if (action.payload.forceUpdate){
				new_articles = state.articles.map((article) => {
          if (article.article_id.to===action.payload.article_id){
            return action.payload.article
					}
					else{
						return article
					}
        })
			}
			else if(action.payload.add){
				new_articles.push(action.payload.article);
      }
      return {...state, articles: new_articles, selectedArticleInfo:action.payload.article, loading:false}

		case ACTIONS.ARTICLE_BOOKMARK:
			selectedArticleInfo = {...state.selectedArticleInfo};
			selectedArticleInfo.bookmarked = action.payload.bookmarked;

			new_articles = state.articles.map((article)=>{
				if (article.article_id.toString() === action.payload.article_id){
					article.bookmarked = action.payload.bookmarked;
					return article;
				}
				else{
					return article;
				}
			})

			return {...state, selectedArticleInfo, articles:new_articles};

		case ACTIONS.BOOKMARKS_LOADING:
			return {...state, bookmarks_loading:true}

		case ACTIONS.BOOKMARKS_ERROR:
			return {...state, bookmarks_error:action.payload}

		case ACTIONS.GET_BOOKMARKS:
			return {...state, bookmarked_articles:action.payload,
			bookmarks_loading:false, bookmarks_error:false}

		default:
			return state
	}
}