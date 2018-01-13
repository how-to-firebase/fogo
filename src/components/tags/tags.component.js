import style from './tags.scss';
import linkState from 'linkstate';
import { Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'unistore';
import { store, actions, mappedActions } from '../../datastore';
import { updateTagsQuery } from '../../queries';

const { updateImage } = mappedActions;

// Preact Material
import TextField from 'preact-material-components/TextField';
import Button from 'preact-material-components/Button';
import 'preact-material-components/TextField/style.css';
import 'preact-material-components/Button/style.css';

// Svg
const spinner = '/assets/svg/spinner.svg';

export default connect('environment,images,searchResults,selection', actions)(
  ({ environment, images, searchResults, selection }) => {
    if (!selection.size) {
      setTimeout(() => {
        route('/images');
      }, 1000);
    } else {
      const selectedImages = getSelectedImages({ images, searchResults, selection });
      const items = getItems({ environment, selectedImages });
      const globalTagItems = getGlobalTagItems({ environment, selectedImages });
      return (
        <div>
          <form class={style.form} onSubmit={handleSubmit({ environment, selectedImages })}>
            <TextField
              className={style.tagsInput}
              type="text"
              label="Tag"
              onInput={linkState(store, 'tagsInput')}
            />
            <Button type="submit">Add Tag</Button>
          </form>

          {!!globalTagItems.length && (
            <div>
              <h3 class={style.globalTagItemsTitle}>All Tags</h3>

              <ul class={style.globalTagItems}>{globalTagItems}</ul>
            </div>
          )}

          <ul class={style.list}>{items}</ul>
        </div>
      );
    }
  }
);

// Extract data
function getSelectedImages({ images, searchResults, selection }) {
  let result;
  if (searchResults) {
    result = searchResults.hits.filter(hit => selection.has(hit.objectID));
  } else {
    result = images.filter(image => selection.has(image.__id));
  }
  return result;
}

function getItems({ environment, selectedImages }) {
  return selectedImages.map(image => {
    const version = (image.versions && image.versions.x200) || { url: spinner };
    const tagItems = image.tags && image.tags.map(getTagItem({ environment, image }));

    return (
      <li>
        <div class={style.image} style={`background-image: url(${version.url})`} />
        <div class={style.secondary}>
          <h3>{image.filename}</h3>
          <ul class={style.tagItems}>{tagItems}</ul>
        </div>
      </li>
    );
  });
}

function getGlobalTagItems({ environment, selectedImages }) {
  const tags = getTags(selectedImages);
  return Array.from(tags).map(getGlobalTagItem({ environment, selectedImages }));
}

function getTags(selectedImages) {
  return selectedImages.reduce((tags, image) => {
    if (image.tags) {
      image.tags.forEach(tag => tags.add(tag));
    }
    return tags;
  }, new Set());
}

function getGlobalTagItem({ environment, selectedImages }) {
  return tag => {
    return (
      <li class={style.tagItem}>
        <img
          src="/assets/svg/delete.svg"
          alt="delete"
          onClick={handleGlobalTagClick({ environment, selectedImages, tag })}
        />
        <span>#{tag}</span>
      </li>
    );
  };
}

function getTagItem({ environment, image }) {
  return tag => {
    return (
      <li class={style.tagItem}>
        <img
          src="/assets/svg/delete.svg"
          alt="delete"
          onClick={handleTagClick({ environment, image, tag })}
        />
        <span>#{tag}</span>
      </li>
    );
  };
}

// Handle events
function handleSubmit({ environment, selectedImages }) {
  return e => {
    e.preventDefault();

    const input = e.target.querySelector('input');
    let hashtag = input.value;
    hashtag = hashtag.toLowerCase();
    hashtag = hashtag.replace(/[^a-z,0-9]/g, '');

    input.value = '';
    input.focus();

    selectedImages
      .map(image => ({ image, tags: new Set(image.tags || []) }))
      .forEach(({ image, tags }) => {
        tags.add(hashtag);
        updateTags({ environment, image, tags });
      });
  };
}

function handleTagClick({ environment, image, tag }) {
  return e => {
    const tags = new Set(image.tags || []);
    tags.delete(tag);
    updateTags({ environment, image, tags });
  };
}

function handleGlobalTagClick({ environment, selectedImages, tag }) {
  return e => {
    selectedImages
      .map(image => ({ image, tags: new Set(image.tags || []) }))
      .filter(({ tags }) => tags.has(tag))
      .forEach(({ image, tags }) => {
        tags.delete(tag);
        updateTags({ environment, image, tags });
      });
  };
}

async function updateTags({ environment, image, tags }) {
  const { __id: id } = image;
  optimisticUpdate({ image, tags });
  await updateTagsQuery({ environment, id, tags });
  bustSearchCache();
}

function optimisticUpdate({ image, tags }) {
  image.tags = Array.from(tags);
  updateImage(image);
}

function bustSearchCache() {
  window.dispatchEvent(new CustomEvent('search-cache-bust'));
}
