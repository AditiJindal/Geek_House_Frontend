import {KEYCODE_PROD} from '../prod_keys';

export const COLORS_LIGHT_THEME = {
  THEME1:'#00b0f0',
  THEME2:'#00b050',

  DARK: '#2d2d2d',
  LESS_DARK: '#555555',
  LESSER_DARK: '#646464',

  LIGHT:'#ffffff',
  LESS_LIGHT:'#d2d2d2',
  MID_LIGHT: "#f3f3f3",
  LESSER_LIGHT:'#fafafa',

  GRAY: '#787878',
  LIGHT_GRAY: '#aaaaaa',
  DARK_GRAY: '#787878',

  LIGHT_BLUE: '#6cd4ec',
  DARK_BLUE: '#2395b1',
  MIGHTNIGHT_BLUE: '#191970',

  VERY_LIGHT_PINK: '#ffb6c1',
  LIGHT_PINK: '#ff91a2',

  RED: '#cb2d3e',
  LIGHT_RED: "#ff5764",
  GREEN: "#63d6a0",
  YELLOW: "#f9a602",
  WHITE: "#FFFFFF",
  FORCE_DARK: "#2d2d2d",
  STAR_YELLOW: "#f5af19",
  OVERLAY_COLOR: "#000000",
  SHIMMER_COLOR: ['#ebebeb', '#c5c5c5', '#ebebeb'],
  URM_COLOR: "#cb2d3e",
  THEME: 'light',
  SHADOW_COLOR: "#202020",
  IS_LIGHT_THEME: true
}

export const COLORS_DARK_THEME = {
  THEME1:'#00b0f0',
  THEME2:'#00b050',

  DARK: '#ffffff',
  LESS_DARK: '#f0f0f0',
  LESSER_DARK: '#e6e6e6',

  LIGHT:'#2d2d2d',
  LESS_LIGHT:'#323232',
  MID_LIGHT: "#3C3C3C",
  LESSER_LIGHT:'#414141',

  GRAY: '#b4b4b4',
  LIGHT_GRAY: '#8c8c8c',
  DARK_GRAY: '#c8c8c8',

  LIGHT_BLUE: '#6cd4ec',
  DARK_BLUE: '#2395b1',
  MIGHTNIGHT_BLUE: '#191970',

  VERY_LIGHT_PINK: '#ffb6c1',
  LIGHT_PINK: '#ff91a2',

  RED: '#ed2939',
  LIGHT_RED: "#ff5764",
  GREEN: "#63d6a0",
  YELLOW: "#f9a602",
  WHITE: "#FFFFFF",
  FORCE_DARK: "#2d2d2d",
  STAR_YELLOW: "#f3c921",
  OVERLAY_COLOR: "#000000",
  SHIMMER_COLOR: ["#323232", "#3c3c3c", "#464646"],
  URM_COLOR: "#63d6a0",
  THEME:'dark',
  SHADOW_COLOR:"#000000",
  IS_LIGHT_THEME: false
};
export const BASE_URL_PROD = "https://stark-beach-17150.herokuapp.com"
export const BASE_URL_DEBUG = "http://192.168.0.103:8000"
export const BASE_URL = (__DEV__)?BASE_URL_DEBUG:BASE_URL_PROD


const KEYCODE_DEBUG = "MBpS0pmNerFI5ppMmvrdL4Cs2ebLvyJ5ZZLPcWredWM8bZLlj0pUUPcKUbjdzR6o"
export const KEYCODE = (__DEV__)?KEYCODE_DEBUG:KEYCODE_PROD;

export const HTTP_TIMEOUT = 12000

export const MESSAGE_SPECIAL_ADDER = "(#SPECIAL%)"

export const LOG_EVENT = {
  SCREEN_CHANGE: 'screen_change',
  AD_CLICKED: 'ad_clicked',
  CURRENT_VIEW_MODE: 'current_view_mode',
  TIME_IN_CHAT: 'time_in_chat',
  TIME_IN_ARTICLE_INFO: 'time_in_article_info',
  ASYNC_STORAGE_TIME: 'async_storage_time',
  MOBILE_DB_TIME: 'mobile_db_time',
  ERROR: 'error'
}

export const URLS = {
  login: '/api/login/',
  welcome: '/api/welcome/',
  settings:'/api/settings/',
  logout: '/api/logout/',
  popularsearches: '/api/popularsearches/',
  closeaccount: '/api/closeaccount/',
  search: '/api/search/',
  articleinfo: '/api/articleinfo/',
  myarticles: '/api/myarticles/',
  publish: '/api/publish/',
  chatpeople: '/api/chatpeople/',
  imageupload: '/api/article/image_upload/',
  comment: '/api/comment/',
  logevent: '/api/logevent/',
  chatpeoplesearch: '/api/chatpeoplesearch/',
  feedback: '/api/feedback/',
  bookmark_article: '/api/bookmark_article/',
  get_bookmarked_articles: '/api/get_bookmarked_articles/',
  policy: '/policy/',
  change_name: '/api/change_name/',
  change_profile_pic: '/api/change_profile_pic/',

  // for notification responses
  uploaded_images: '/api/uploaded_images/',
  check_image_permission: "/check_image_permission/",
  check_app_installed: "/check_app_installed/"
}

export const FONTS = {
  PRODUCT_SANS:'Product-Sans',
  PRODUCT_SANS_BOLD:'Product-Sans-Bold',

  HELVETICA_NEUE:'HelveticaNeue',

  GOTHAM_BLACK:'Gotham-Black',

  // LATO FONT
  LATO: 'Lato-Regular',
  LATO_BLACK: 'Lato-Black',
  LATO_BOLD: 'Lato-Bold',
  LATO_THIN: 'Lato-THIN',

  // RALEWAY FONT
  RALEWAY: 'Raleway-Regular',
  RALEWAY_BLACK: 'Raleway-Black',
  RALEWAY_BOLD: 'Raleway-Bold',
  RALEWAY_LIGHT: 'Raleway-Light',

  MATIZ_HEADING: 'Matiz',
  
  MERRIWEATHER: 'Merriweather',
  MERRIWEATHER_BOLD: 'Merriweather-Bold',
  MERRIWEATHER_LIGHT: 'Merriweather-Light',

  // STYLISH FONT
  LECKERLIONE: 'LeckerliOne-Regular'
}


export const COLOR_COMBOS = [
  ['rgb(72, 76, 75)', 'rgb(14, 150, 162)'],
  ['rgb(50, 93, 127)', 'rgb(103, 93, 121)'],
  ['rgb(0, 76, 112)', 'rgb(0, 147, 209)'],
  ['rgb(147, 34, 141)', 'rgb(184, 75, 158)'],
  ['#2193b0','#6dd5ed'],
  ['#cc2b5e', '#753a88'],
  ['#42275a','#734b6d'],
  ['#de6262','#ffb88c'],
  ['#06beb6','#48b1bf'],
  ['#56ab2f','#a8e063'],
  ['#614385','#516395'],
  ['#7b4397','#dc2430'],
  ['#4568dc','#b06ab3'],
  ['#4ca1af','#c4e0e5'],
  ['#ff5f6d','#ffc371'],
  ['#834d9b', '#d04ed6'],
  ['#2980b9', '#2c3e50'],
  ['#403A3E', '#BE5869'],
  ['#00C9FF', '#62AE5D'],
]

export const ICON_SIZE = 18

export const SELECTED_ICON_SIZE = 28

export const ERROR_BUTTONS={
  TICK:'tick',
  CROSS:'cross',
}

export const ERROR_MESSAGES = {
  NO_SEARCH_CHARACTER:{
    title: "Type something...", 
    content: "Please type something in the search bar", 
    type:[
      {label:ERROR_BUTTONS.TICK},
    ]
  },
  ONE_SEARCH_CHARACTER:{
    title: "Type something more...", 
    content: "We can't search for just one character, please enter some more characters . . . ", 
    type:[
      {label:ERROR_BUTTONS.TICK},
    ]
  },
  LET_PREVIOUS_SEARCH_COMPLETE:{
    title: "Please let this search complete",
    content: "A search is going on. Please wait for it to finish, then you can search again",
    type:[
      {label:ERROR_BUTTONS.TICK},
    ]
  },
  CONFIRM_WRITE_VIEW_DELETE:{
    title: "Do you want to delete this card?",
    content: "You are about to delete this card, it has content in it",
    type:[
      {label:'Cancel', color:COLORS_LIGHT_THEME.RED},
      {label:ERROR_BUTTONS.TICK},
    ]
  }
}

export const LATEST_APP_VERSION = 22;