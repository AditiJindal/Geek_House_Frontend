import {ACTIONS} from '../actions/types'

const INITIAL_STATE={
  data:{},
  googleLoading:false,
  facebookLoading:false,
  loading: true,
  authtoken:'',
  categories:[],
  policy: null,
  policyLoading:true,
  internetReachable:false
}

export default (state=INITIAL_STATE, action) => {
  switch (action.type){

    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE, loading: false}

    case ACTIONS.LOADING_FB:
      return {...state, facebookLoading:action.payload}

    case ACTIONS.LOADING_GOOGLE:

      return {...state, googleLoading:action.payload}

    case ACTIONS.CHECKING_LOGIN: 
      return {...state, loading: true}

    case ACTIONS.LOGIN_DATA:
      return {
        ...state,
        data:action.payload.data,
        facebookLoading:false, 
        googleLoading:false,
        authtoken:action.payload.authtoken, 
        loading:false, 
        categories:action.payload.categories
      };

    case ACTIONS.LOGIN_POLICY:
      return {
        ...state,
        policy:{
          cards: action.payload.cards,
          links: action.payload.links
        },
        policyLoading:false
      };

    case ACTIONS.LOGIN_INTERNET_REACHABLE:
      return {...state, internetReachable:action.payload}

    default:
      return state;
  }
}