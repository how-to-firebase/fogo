import './style';
import { Component } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore';
import { store, mappedActions } from './datastore';
import Match from 'preact-router/match';

const { route } = Router;

const { setCurrentUser, setPath, setToken } = mappedActions;

// Quiver
import FirebaseAuthentication from '@quiver/firebase-authentication';
import StorageUploader from '@quiver/storage-uploader';

// Dependencies
import Nav from './components/nav/nav.component';
import Drawer from './components/drawer/drawer.component';
import Guard from './components/guard/guard.component';

// Preact Material Components
import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';

// Views
import { HomeView } from './components/views';

export default class Fogo extends Component {
  componentWillMount() {
    registerOnAuthStateChanged();

    addEventListener('alert', e =>
      this.snackbar.MDComponent.show({
        message: e.detail,
      })
    );
  }

  componentDidMount() {
    registerStorageUploaderListeners();
    registerIdTokenRefreshListener();
  }

  render() {
    const { environment } = store.getState();

    return (
      <Provider store={store}>
        <div id="app-wrapper">
          <Match>{handlePath}</Match>
          <Guard />
          <Nav />
          <Drawer />
          <Snackbar ref={snackbar => (this.snackbar = snackbar)} style="z-index: 1000;" />
          <div class="full-height router-wrapper">
            <Router>
              <FirebaseAuthentication google path="/login" />
              <HomeView path="/images" environment={environment} />
              <div path="/play">Path: /play</div>
              <StorageUploader
                path="/upload"
                mime-types="image/jpeg,image/gif,image/png"
                folder={environment.storage.path}
              />
              <div default>404</div>
            </Router>
          </div>
        </div>
      </Provider>
    );
  }
}

function registerOnAuthStateChanged() {
  window.firebase.auth().onAuthStateChanged(setCurrentUser);
}

function registerStorageUploaderListeners() {
  addEventListener('storageUploaderComplete', e => route('/'));

  addEventListener('storageUploaderError', e =>
    dispatchEvent(new CustomEvent('alert', { detail: e.detail.error.message }))
  );
}

function registerIdTokenRefreshListener() {
  let idTokenRefreshRef;
  let handler;
  store.subscribe(({ environment, token, laggedCurrentUser, currentUser }) => {
    if (handler && laggedCurrentUser && currentUser && laggedCurrentUser.uid != currentUser.uid) {
      idTokenRefreshRef.off('value', handler);
      handler = null;
    } else if (!handler && environment && currentUser.uid) {
      idTokenRefreshRef = getIdTokenRefreshRef({ environment, uid: currentUser.uid });
      handler = idTokenRefreshRef.on('value', snapshot => {
        getToken({ currentUser, force: true }).then(setToken);
      });
    }
  });
}

function getIdTokenRefreshRef({ environment, uid }) {
  const path = environment.refs.idTokenRefresh.replace(/\{uid\}/, uid);
  return window.firebase.database().ref(path);
}

function getToken({ currentUser, force }) {
  //https://firebase.google.com/docs/auth/admin/custom-claims
  return currentUser
    .getIdToken(force)
    .then(idToken => JSON.parse(b64DecodeUnicode(idToken.split('.')[1])));
}

function b64DecodeUnicode(str) {
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

function handlePath({ path }) {
  setPath(path);
}
