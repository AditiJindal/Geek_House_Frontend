import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import ReduxThunk from 'redux-thunk';
import reducers from './src/reducers';
import RouterComponent from './src/Router';

// import * as Sentry from "@sentry/react-native";
// import Constants from 'expo-constants';

// Sentry.init({
//   dsn:'https://6b7690bce216418c8548a265e31eb505@sentry.io/1858364',
//   enableInExpoDevelopment:true,
//   debug:true
// });
// Sentry.setRelease(Constants.manifest.revisionId);
console.disableYellowBox=true
export default class App extends Component{

  constructor(){
    super();
  }

  render(){
    const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
    return (
      <Provider store={store}>
        <RouterComponent/>
      </Provider>
    );
  };
}