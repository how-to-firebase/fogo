import './style';
import { Component } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore';
import { store } from './datastore';
import Match from 'preact-router/match';

const { route } = Router;

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
  get auth() {
    return window.firebase.auth();
  }

  componentWillMount() {
    this.registerOnAuthStateChanged();

    addEventListener('alert', e =>
      this.snackbar.MDComponent.show({
        message: e.detail,
      })
    );
  }

  componentDidMount() {
    this.registerStorageUploaderListeners();
  }

  registerOnAuthStateChanged() {
    this.auth.onAuthStateChanged(currentUser => {
      const { currentUser: laggedCurrentUser } = store.getState();
      store.setState({ laggedCurrentUser, currentUser });
    });
  }

  registerStorageUploaderListeners() {
    addEventListener('storageUploaderComplete', e => {
      route('/');
    });
  }

  render() {
    const { environment } = store.getState();

    return (
      <Provider store={store}>
        <div id="app-wrapper">
          <Match>{this.handlePath}</Match>
          <Guard />
          <Nav />
          <Drawer />
          <Snackbar ref={snackbar => (this.snackbar = snackbar)} style="z-index: 1000;" />
          <div class="full-height router-wrapper">
            <Router>
              <FirebaseAuthentication google path="/login" />
              <HomeView path="/" />
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

  handlePath({ matches, path, url }) {
    const { path: laggedPath } = store.getState();
    store.setState({ laggedPath, path });
  }
}
