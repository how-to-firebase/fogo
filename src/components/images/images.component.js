import { Component } from 'preact';
import style from './images.scss';
import { connect } from 'unistore';
import { store, actions, mappedActions } from '../../datastore';

const {
  loadImages,
  loadImageVersion,
  setSelecting,
  addSelection,
  removeSelection,
  clearSelection,
} = mappedActions;

// Preact Material
import GridList from 'preact-material-components/GridList';
import Button from 'preact-material-components/Button';
import Icon from 'preact-material-components/Icon';
import 'preact-material-components/GridList/style.css';
import 'preact-material-components/Button/style.css';
import 'preact-material-components/Icon/style.css';

// Svg
import spinnerSvg from '../../assets/svg/spinner.svg';

function handleKeyup(e) {
  if (e.key == 'Escape') {
    setSelecting(false);
    clearSelection();
  } 
}

@connect(({ images, selecting, selection }) => ({ images, selecting, selection }))
export default class Images extends Component {
  componentWillMount() {
    loadImages();
    window.document.addEventListener('keyup', handleKeyup);
  }

  componentWillUnmount() {
    window.document.removeEventListener('keyup', handleKeyup);
  }

  render({ images, selecting, selection }) {
    const items = images.map(image => {
      const id = image.__id;
      const name = image.name.split('/').pop();
      const width = 250;
      const version = (image.versions && image.versions[width]) || {};
      const isSelected = selection.has(id);

      if (!version.url) {
        loadImageVersion({ record: image.__id, width });
      }

      function iconClick() {
        if (!isSelected) {
          setSelecting(true);
          addSelection(id);
        } else {
          if (selection.size == 1) {
            setSelecting(false);
          } 
          removeSelection(id);
        }
        
      }

      return (
        <li class={style.item} is-selected={isSelected}>
          <Icon className={`${style.icon}`} onClick={iconClick}>
            done
          </Icon>
          <div class={style.description}>{name}</div>
          <div class={style.image}>
            <img src={version.url || spinnerSvg} alt={name} />
          </div>
        </li>
      );
    });

    return (
      <div>
        <ul class={style.grid} selecting={selecting}>
          {items}
        </ul>

        <Button className={style.loadMore} onClick={loadImages}>
          Load More
        </Button>
      </div>
    );
  }
}
