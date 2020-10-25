import ReduxThunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
import freeze from 'redux-freeze';

const middleware = [];

const logger = createLogger({
  diff: true,
  collapsed: true,
  stateTransformer: (state) => ({chat: state.chat}),
});

middleware.push(ReduxThunk); // for async actions
if (__DEV__) {
  middleware.push(logger); // for logging redux state
}

export default middleware;
