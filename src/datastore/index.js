import { createStore } from 'unistore';
import * as rawActions from './actions';
import environment from '../environment';

const store = createStore({
  showMenu: false,
  path: null,
  laggedPath: null,
  laggedCurrentUser: null,
  environment,
  images: [],
  imagesAllLoaded: false
});

const actions = store => rawActions;

const mappedActions = {};
for (let i in rawActions ) {
  mappedActions[i] = store.action(rawActions[i]);
}

store.subscribe(state => {
  console.log('state', state);
});

export { store, actions, mappedActions };
