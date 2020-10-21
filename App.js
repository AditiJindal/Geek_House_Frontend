import React, {Component} from 'react';
import {LogBox} from 'react-native';
import {Provider} from 'react-redux';
import {store} from './src/reducers';
import PushNotification from 'react-native-push-notification';
import codePush from 'react-native-code-push';
import Router from './src/Router';

PushNotification.cancelAllLocalNotifications();

LogBox.ignoreAllLogs();
class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router />
      </Provider>
    );
  }
}

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
};

export default codePush(codePushOptions)(App);
