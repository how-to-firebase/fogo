import { createStore } from 'unistore';
import * as rawActions from './actions';
import environment from '../environment';

let startingState = {
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
  searching: false,
  searchResults: null,
  selecting: false,
  selection: new Set(),
  showMenu: false,
  timestamp: Date.now(),
  token: null,
};
const serialized = localStorage.getItem('fogo-state');
if (serialized) {
  startingState = deserialize(serialized);
}

const store = createStore(startingState);

const actions = store => rawActions;

const mappedActions = {};
for (let i in rawActions) {
  mappedActions[i] = store.action(rawActions[i]);
}

store.subscribe(state => {
  const serialized = serialize(state);
  localStorage.setItem('fogo-state', serialized);
  console.log('state', state);
});

function serialize(state) {
  const { images, selection, selecting } = state;
  const serialized = { images, selection: Array.from(selection), selecting };
  return JSON.stringify(serialized);
}

function deserialize(serialized) {
  const { images, selection: selectionArray, selecting } = JSON.parse(serialized);
  return { ...startingState, images, selection: new Set(selectionArray), selecting };
}

export { store, actions, mappedActions };
