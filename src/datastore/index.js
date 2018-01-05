import { createStore } from 'unistore';
import * as rawActions from './actions';
import environment from '../environment';

const store = createStore({
  currentUser: null,
  environment,
  images: [],
  image: null,
  imagesAllLoaded: false,
  imagesObserver: null,
  laggedPath: null,
  laggedCurrentUser: null,
  listState: null,
  path: null,
  search: '',
  selecting: false,
  selection: new Set(),
  showMenu: false,
  timestamp: Date.now(),
  token: null,
});

const actions = store => rawActions;

const mappedActions = {};
for (let i in rawActions) {
  mappedActions[i] = store.action(rawActions[i]);
}

store.subscribe(state => {
  console.log('state', state);
});

export { store, actions, mappedActions };
