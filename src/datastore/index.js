import { createStore } from 'unistore';
import * as rawActions from './actions';
import environment from '../environment';

const store = createStore({
  controlSelect: false,
  environment,
  images: [],
  image: null,
  imagesAllLoaded: false,
  showMenu: false,
  laggedPath: null,
  laggedCurrentUser: null,
  listState: null,
  path: null,
  selecting: false,
  selection: new Set(),
  shiftSelect: false,
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
