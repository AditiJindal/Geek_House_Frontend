import {ACTIONS} from '../actions/types'

const INITIAL_STATE={
  data:{},
  googleLoading:false,
  facebookLoading:false,
  loading: true,
  error:'',
  authtoken:'',
  categories:[],
  first_login: false
}

export default (state=INITIAL_STATE, action) => {
  switch (action.type){

    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE, loading: false}

    case ACTIONS.LOADING_FB:
      return {...state, facebookLoading:true, error:''}

    case ACTIONS.LOADING_GOOGLE:

      return {...state, googleLoading:true, error:''}

    case ACTIONS.CHECKING_LOGIN: 
      return {...state, loading: true}

    case ACTIONS.LOGIN_DATA:
      // console.log("insied login data!: ", action.payload)
      return {
        ...state,
        data:action.payload.data,
        facebookLoading:false, 
        googleLoading:false, error:'', 
        authtoken:action.payload.authtoken, 
        loading:false, 
        categories:action.payload.categories
      };

    case ACTIONS.LOGIN_FIRST_LOGIN:
      return {...state, first_login: action.payload}
    
    case ACTIONS.LOGIN_ERROR:
      return {data:{}, facebookLoading:false, googleLoading:false, error:action.payload, authtoken:'', loading:false};

    default:
      return state;
  }
}