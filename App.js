import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import ReduxThunk from 'redux-thunk';
import reducers from './src/reducers';
import RouterComponent from './src/Router';
import crashlytics from '@react-native-firebase/crashlytics';
import PushNotification from "react-native-push-notification";
import codePush from 'react-native-code-push'


PushNotification.cancelAllLocalNotifications()
crashlytics().setCrashlyticsCollectionEnabled(true);
export const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
console.disableYellowBox = true
class App extends Component{

  constructor(){
    super();
  }

  render(){
    return (
      <Provider store={store}>
        <RouterComponent/>
      </Provider>
    );
  };
}

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
};

export default codePush(codePushOptions)(App);