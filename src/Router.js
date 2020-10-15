import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';

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
import Drawer from './screens/Drawer';
import {BottomTab} from './components';

import {COLORS_DARK_THEME, SCREENS} from './Constants';

//Create Navigators
const LoginStack = createStackNavigator();
const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

const Tabs = createBottomTabNavigator();

const DrawerStack = createDrawerNavigator();

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

const DrawerNavigator = () => {
  return (
    <DrawerStack.Navigator
      drawerType="slide"
      drawerContent={(props) => <Drawer {...props} />}>
      <DrawerStack.Screen name={SCREENS.MainTab} component={TabNavigator} />

      <DrawerStack.Screen
        name={SCREENS.Notification}
        component={Notification}
      />
      <DrawerStack.Screen name={SCREENS.Settings} component={Settings} />
      <DrawerStack.Screen name={SCREENS.Feedback} component={Feedback} />
      <DrawerStack.Screen name={SCREENS.About} component={About} />
      <DrawerStack.Screen name={SCREENS.Explore} component={Explore} />
      <DrawerStack.Screen name={SCREENS.Rewards} component={Rewards} />
      <DrawerStack.Screen name={SCREENS.Policy} component={Policy} />
      <DrawerStack.Screen name={SCREENS.ChatScreen} component={ChatScreen} />
      <DrawerStack.Screen name={SCREENS.Bookmark} component={Bookmark} />
    </DrawerStack.Navigator>
  );
};

const MainNavigator = () => {
  // Main app navigator, used for screens that do not contain the drawer and displaying the
  // drawer navigator
  return (
    <MainStack.Navigator
      headerMode="none"
      initialRouteName={SCREENS.MainTab}
      screenOptions={{
        headerShown: false,
      }}>
      {/* Drawer navigator */}
      <MainStack.Screen name={SCREENS.Drawer} component={DrawerNavigator} />

      {/* Individual Screens */}

      <MainStack.Screen name={SCREENS.WriteArticle} component={WriteArticle} />
      <MainStack.Screen name={SCREENS.ImageUpload} component={ImageUpload} />
      <MainStack.Screen name={SCREENS.Publish} component={Publish} />
      <MainStack.Screen
        name={SCREENS.NotificationArticle}
        component={NotificationArticle}
      />
    </MainStack.Navigator>
  );
};

const RootNavigator = () => {
  return (
    <RootStack.Navigator headerMode="none">
      <RootStack.Screen name={SCREENS.Login} component={LoginNavigator} />
      <RootStack.Screen name={SCREENS.Main} component={MainNavigator} />
    </RootStack.Navigator>
  );
};

const Router = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Router;
