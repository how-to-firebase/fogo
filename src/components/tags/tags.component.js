import { Component } from 'preact';
import style from './tags.scss';
import { connect } from 'unistore';
import { route } from 'preact-router';
import { store, actions, mappedActions } from '../../datastore';
import linkState from 'linkstate';
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
      const selectedImages = images.filter(image => selection.has(image.__id));
      const items = selectedImages.map(getItem({ environment }));
      const tags = selectedImages.reduce((tags, image) => {
        if (image.tags) {
          image.tags.forEach(tag => tags.add(tag));
        }
        return tags;
      }, new Set());
      const globalTagItems = Array.from(tags).map(getGlobalTagItem({ environment, images }));
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
          <ul class={style.globalTagItems}>{globalTagItems}</ul>
          <ul class={style.list}>{items}</ul>
        </div>
      );
    }
  }
);

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
      const tags = new Set(images.tags || []);
      tags.add(hashtag);
      updateTagsQuery({ environment, id, tags });
    });
  };
}

function getItem({ environment }) {
  return image => {
    const version = image.versions.x200;
    const name = image.name.split('/').pop();
    const tagItems = image.tags.map(getTagItem({ environment, image }));

    return (
      <li>
        <div class={style.image} style={`background: url(${version.url})`} />
        <div class={style.secondary}>
          <h3>{name}</h3>
          <ul class={style.tagItems}>{tagItems}</ul>
        </div>
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

function handleTagClick({ environment, image, tag }) {
  return e => {
    const tags = new Set(image.tags || []);
    tags.delete(tag);

    optimisticUpdate({ image, tags });
    updateTagsQuery({ environment, tags, id: image.__id });
  };
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
