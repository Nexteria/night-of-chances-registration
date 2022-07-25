import React from 'react';
import { Route } from 'react-router';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createStorageEngine from 'redux-storage-engine-localstorage';
import 'bootstrap/dist/css/bootstrap.css';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter } from 'react-router-redux';
import * as firebase from 'firebase/app';
import 'react-overlay-loader/styles.css';
import 'firebase/auth';
import 'firebase/database';


import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import configureStore from './common/configureStore';
import createInitialState from './common/createInitialState';

var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
const fireApp = firebase.initializeApp(config);

const initialState = createInitialState();
const store = configureStore({
  initialState,
  platformDeps: { createStorageEngine, firebase: fireApp },
  platformMiddleware: [],
});

const history = createHistory();

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path="/:section?" component={App} />
    </ConnectedRouter>
  </Provider>, document.getElementById('root'));
registerServiceWorker();
