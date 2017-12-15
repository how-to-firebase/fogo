import { createStore } from 'unistore';
import * as rawActions from './actions';
import environment from '../environment';

const store = createStore({
  showMenu: false,
  path: null,
  laggedPath: null,
  laggedCurrentUser: null,
  environment,
});

const actions = store => rawActions;

store.subscribe(state => {
  console.log('state', state);
});

export { store, actions };
