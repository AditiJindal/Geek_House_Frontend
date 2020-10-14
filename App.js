import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import ReduxThunk from 'redux-thunk';
import reducers from './src/reducers';
import PushNotification from 'react-native-push-notification';
import codePush from 'react-native-code-push';
import Router from './src/Router';

PushNotification.cancelAllLocalNotifications();
export const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
console.disableYellowBox = true;
class App extends Component {
  constructor() {
    super();
  }

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
