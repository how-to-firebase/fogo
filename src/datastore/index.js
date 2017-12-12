import { createStore } from 'unistore';
import * as rawActions from './actions';

const store = createStore({
  showMenu: false,
  path: null,
  laggedPath: null,
  laggedCurrentUser: null,
});

const actions = store => rawActions;

store.subscribe(state => {
  console.log('state', state);
});

export { store, actions };
