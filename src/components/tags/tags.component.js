import { Component } from 'preact';
import style from './tags.scss';
import { connect } from 'unistore';
import { route } from 'preact-router';
import { store, actions, mappedActions } from '../../datastore';
import linkState from 'linkstate';
import { updateTagsQuery } from '../../queries';

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
      const items = selectedImages.map(getItem);
      return (
        <div>
          <form
            class={style.form}
            onSubmit={e => handleSubmit(e, { environment, images, selection })}
          >
            <TextField
              className={style.tagsInput}
              type="text"
              label="Tag"
              onInput={linkState(store, 'tagsInput')}
            />
            <Button type="submit">Add Tag</Button>
          </form>
          <ul class={style.list}>{items}</ul>
        </div>
      );
    }
  }
);

function handleSubmit(e, { environment, images, selection }) {
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
}

function getItem(image) {
  const version = image.versions.x200;
  const name = image.name.split('/').pop();
  return (
    <li>
      <div class={style.image} style={`background: url(${version.url})`} />
      <div class={style.secondary}>
        <h3>{name}</h3>
      </div>
    </li>
  );
}
