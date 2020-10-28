import {StatusBar} from 'react-native';
import changeNavBarColor from 'react-native-navigation-bar-color';

export const changeBarColors = (color, isLightTheme) => {
  // change color of navigation and statusbar
  StatusBar.setBackgroundColor(color);
  StatusBar.setBarStyle(isLightTheme ? 'dark-content' : 'light-content');
  changeNavBarColor(color, isLightTheme);
};
