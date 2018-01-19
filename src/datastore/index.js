import { createStore } from 'unistore';
import * as rawActions from './actions';
import environment from '../environment';

let startingState = {
  currentUser: null,
  deletedImages: new Set(),
  environment,
  images: [],
  image: null,
  imagesAllLoaded: false,
  imagesObserver: null,
  laggedPath: null,
  laggedCurrentUser: null,
  listState: null,
  isAdmin: false,
  path: null,
  search: '',
  searching: false,
  searchResults: null,
  selecting: false,
  selection: new Set(),
  showMenu: false,
  tags: new Set(),
  timestamp: Date.now(),
  token: null,
};
const serialized = localStorage.getItem('fogo-state');
if (serialized) {
  startingState = deserialize(serialized);
  const { deletedImages, images } = removeDeletedImages(startingState);
  startingState.deletedImages = deletedImages;
  startingState.images = truncateImages(images);
}

const store = createStore(startingState);

const actions = store => rawActions;

const mappedActions = {};
for (let i in rawActions) {
  mappedActions[i] = store.action(rawActions[i]);
}

store.subscribe(state => {
  const { laggedCurrentUser, currentUser } = state;

  if (currentUser) {
    const serialized = serialize(state);
    localStorage.setItem('fogo-state', serialized);
  } else if (laggedCurrentUser) {
    localStorage.removeItem('fogo-state');
  }

  window.state = state;
});

function serialize(state) {
  const { deletedImages, images, selection, selecting, tags } = state;
  const serialized = {
    deletedImages: Array.from(deletedImages),
    images,
    selection: Array.from(selection),
    selecting,
    tags: Array.from(tags),
  };
  return JSON.stringify(serialized);
}

function deserialize(serialized) {
  const { deletedImages, images, selection: selectionArray, selecting, tags } = JSON.parse(
    serialized
  );
  return {
    ...startingState,
    deletedImages: new Set(deletedImages),
    images,
    selection: new Set(selectionArray),
    selecting,
    tags: new Set(tags),
  };
}

function truncateImages(images) {
  return images.slice(0, 25);
}

function removeDeletedImages({ deletedImages, images }) {
  const filteredDeletedImages = new Set();
  const filteredImages = images.filter(({ __id }) => {
    const isDeleted = deletedImages.has(__id);
    if (!isDeleted) {
      filteredDeletedImages.add(__id);
    }
    return !isDeleted;
  });
  return { deletedImages: filteredDeletedImages, images: filteredImages };
}

function bustCache() {
  localStorage.removeItem('fogo-state');
}

export { actions, bustCache, mappedActions, store };
