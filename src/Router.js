import React from 'react';
import { Scene, Router, ActionConst} from 'react-native-router-flux';
import Login from './screens/Login';
import Home from './screens/Home';
import Search from './screens/Search';
import Write from './screens/Write';
import Chat from './screens/Chat';
import WriteArticle from './screens/WriteArticle';
import ImageUpload from './screens/ImageUpload';
import Publish from './screens/Publish';
import ChatScreen from './screens/ChatScreen';
import Settings from './screens/Settings';
import About from './screens/About';
import Feedback from './screens/Feedback';
import Bookmark from './screens/Bookmark';
import NotificationArticle from './screens/NotificationArticle';
import { COLORS_DARK_THEME } from './Constants';


const RouterComponent = () => {
    return (
      <Router sceneStyle={{backgroundColor:COLORS_DARK_THEME.LIGHT}} >
        <Scene key="root">
          <Scene key="login_main" hideNavBar initial type={ActionConst.RESET}>
            <Scene key="login" component={Login} hideNavBar type={ActionConst.RESET}/>
          </Scene>
          <Scene key="main" hideNavBar>
            <Scene key="home" component={Home} hideNavBar initial/>
            <Scene key="search" component={Search} hideNavBar/>
            <Scene key="write" component={Write} hideNavBar/>
            <Scene key="chat" component={Chat} hideNavBar/>
            <Scene key="writearticle" component={WriteArticle} hideNavBar/>
            <Scene key="imageupload" component={ImageUpload} hideNavBar/>
            <Scene key="publish" component={Publish} hideNavBar/>
            <Scene key="chatscreen" component={ChatScreen} hideNavBar/>
            <Scene key="settings" component={Settings} hideNavBar/>
            <Scene key="feedback" component={Feedback} hideNavBar/>
            <Scene key="bookmark" component={Bookmark} hideNavBar/>
            <Scene key="about" component={About} hideNavBar/>
            <Scene key="notification_article" component={NotificationArticle} hideNavBar/>
          </Scene>
        </Scene>
      </Router>
    );
};
  
export default RouterComponent;