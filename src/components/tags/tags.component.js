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

export default connect('environment,images,selection', actions)(
  ({ environment, images, selection }) => {
    if (!selection.size) {
      setTimeout(() => {
        route('/images');
      }, 1000);
    } else {
      const selectedImages = getSelectedImages({ images, selection });
      const items = getItems({ environment, selectedImages });
      const globalTagItems = getGlobalTagItems({ environment, images, selectedImages });
      return (
        <div>
          <form class={style.form} onSubmit={handleSubmit({ environment, images, selection })}>
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
function getSelectedImages({ images, selection }) {
  return images.filter(image => selection.has(image.__id));
}

function getItems({ environment, selectedImages }) {
  return selectedImages.map(image => {
    const version = image.versions.x200;
    const name = image.name.split('/').pop();
    const tagItems = image.tags && image.tags.map(getTagItem({ environment, image }));

    return (
      <li>
        <div class={style.image} style={`background: url(${version.url})`} />
        <div class={style.secondary}>
          <h3>{name}</h3>
          <ul class={style.tagItems}>{tagItems}</ul>
        </div>
      </li>
    );
  });
}

function getGlobalTagItems({ environment, images, selectedImages }) {
  const tags = getTags(selectedImages);
  return Array.from(tags).map(getGlobalTagItem({ environment, images }));
}

function getTags(selectedImages) {
  return selectedImages.reduce((tags, image) => {
    if (image.tags) {
      image.tags.forEach(tag => tags.add(tag));
    }
    return tags;
  }, new Set());
}

function getGlobalTagItem({ environment, images }) {
  return tag => {
    return (
      <li class={style.tagItem}>
        <img
          src="/assets/svg/delete.svg"
          alt="delete"
          onClick={handleGlobalTagClick({ environment, images, tag })}
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
function handleSubmit({ environment, images, selection }) {
  return e => {
    e.preventDefault();

    const input = e.target.querySelector('input');
    let hashtag = input.value;
    hashtag = hashtag.toLowerCase();
    hashtag = hashtag.replace(/[^a-z,0-9]/g, '');

    input.value = '';
    input.focus();

    selection.forEach(id => {
      const image = images.find(image => image.__id == id);
      const tags = new Set(image.tags || []);
      tags.add(hashtag);
      updateTagsQuery({ environment, id, tags });
    });
  };
}

function handleTagClick({ environment, image, tag }) {
  return e => {
    const tags = new Set(image.tags || []);
    tags.delete(tag);

    optimisticUpdate({ image, tags });
    updateTagsQuery({ environment, tags, id: image.__id });
  };
}

function handleGlobalTagClick({ environment, images, tag }) {
  return e => {
    images.forEach(image => {
      const tags = new Set(image.tags || []);
      tags.delete(tag);

      optimisticUpdate({ image, tags });
      updateTagsQuery({ environment, tags, id: image.__id });
    });
  };
}

function optimisticUpdate({ image, tags }) {
  image.tags = Array.from(tags);
  updateImage(image);
}
