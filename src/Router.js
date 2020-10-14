import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

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
import Notification from './screens/Notification';
import Policy from './screens/Policy';
import Explore from './screens/Explore';
import Rewards from './screens/Rewards';
import {BottomTab} from './components';

import {COLORS_DARK_THEME, SCREENS} from './Constants';

//Create Navigators
const LoginStack = createStackNavigator();
const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

const Tabs = createBottomTabNavigator();

//Login Navigation
const LoginNavigator = () => {
  return (
    <LoginStack.Navigator headerMode="none">
      <LoginStack.Screen name={SCREENS.Login} component={Login} />
      <LoginStack.Screen name={SCREENS.Policy} component={Policy} />
    </LoginStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tabs.Navigator tabBar={(props) => <BottomTab {...props} />}>
      <Tabs.Screen name={SCREENS.Home} component={Home} />
      <Tabs.Screen name={SCREENS.Search} component={Search} />
      <Tabs.Screen name={SCREENS.Write} component={Write} />
      <Tabs.Screen name={SCREENS.Chat} component={Chat} />
    </Tabs.Navigator>
  );
};

const MainNavigator = () => {
  // Main app navigator, used for screens thats are not a part of bottom tab from other stacks
  return (
    <MainStack.Navigator
      headerMode="none"
      initialRouteName={SCREENS.MainTab}
      screenOptions={{
        headerShown: false,
      }}>
      <MainStack.Screen name={SCREENS.MainTab} component={TabNavigator} />

      <MainStack.Screen name={SCREENS.Settings} component={Settings} />
      <MainStack.Screen name={SCREENS.Feedback} component={Feedback} />
      <MainStack.Screen name={SCREENS.About} component={About} />
      <MainStack.Screen name={SCREENS.Explore} component={Explore} />
      <MainStack.Screen name={SCREENS.Rewards} component={Rewards} />
      <MainStack.Screen name={SCREENS.Notification} component={Notification} />
      <MainStack.Screen name={SCREENS.Policy} component={Policy} />
      <MainStack.Screen name={SCREENS.Bookmark} component={Bookmark} />
      <MainStack.Screen name={SCREENS.WriteArticle} component={WriteArticle} />
      <MainStack.Screen name={SCREENS.ImageUpload} component={ImageUpload} />
      <MainStack.Screen name={SCREENS.Publish} component={Publish} />
      <MainStack.Screen
        name={SCREENS.NotificationArticle}
        component={NotificationArticle}
      />
      <MainStack.Screen name={SCREENS.ChatScreen} component={ChatScreen} />
    </MainStack.Navigator>
  );
};

const Router = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator headerMode="none">
        <RootStack.Screen name={SCREENS.Login} component={LoginNavigator} />
        <RootStack.Screen name={SCREENS.Main} component={MainNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default Router;
