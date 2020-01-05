import {ACTIONS} from '../actions/types'

const INITIAL_STATE={
  overlayVisible:false,
  welcomeData:{},
  loading:true,
  error: '',
  selected_category: '',
  image_adder:""
}

export default (state=INITIAL_STATE, action) => {
  switch (action.type){

    case ACTIONS.LOGOUT:
      return {...INITIAL_STATE};

    case ACTIONS.TOGGLE_OVERLAY:
      return {...state, ...action.payload, error:''};

    case ACTIONS.WELCOME:
      return {...state, welcomeData:action.payload, loading:false, error:'', image_adder:action.payload.image_adder}
    
    case ACTIONS.HOME_ERROR:
      return {...state, error:action.payload, loading:false}

    case ACTIONS.HOME_LOADING:
      return {...state, loading:true, error:''}

    case ACTIONS.CHAT_SOCKET_CHANGE_CATEGORY:
      return {...state, selected_category:action.payload}

    default:
      return state;
  }
}