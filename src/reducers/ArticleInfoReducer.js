import {ACTIONS} from '../actions/types';

const INITIAL_STATE = {
	articles:[],
	selectedArticleInfo:{},
	loading:false
}

export default (state=INITIAL_STATE, action) => {
	
	switch (action.type){
		case ACTIONS.LOGOUT:
			console.log("ACTION.LOGOUT HERE 4")
      return {...INITIAL_STATE}

    case ACTIONS.ARTICLE_INFO_LOADING:
      return {...state, loading:true}

		case ACTIONS.GET_ARTICLE_INFO:
			let new_articles=[...state.articles]
			if (action.payload.forceUpdate){
				new_articles = state.articles.map((article) => {
          if (article.article_id===action.payload.article_id){
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
			
		// case ACTIONS.ARTICLE_ADD_COMMENT:
		// 	selectedArticleInfo = {...state.selectedArticleInfo}
		// 	// console.log("Select article info: ", selectedArticleInfo)
		// 	if (selectedArticleInfo.comments[0].editable){
		// 		// edit that comment
		// 		selectedArticleInfo.comments[0].rating = action.payload.rating
		// 		selectedArticleInfo.comments[0].comment = action.payload.comment
		// 	}
		// 	else{
		// 		// add that comment in the top
		// 	}

		// 	return {...state, selectedArticleInfo}

		default:
			return state
	}
}