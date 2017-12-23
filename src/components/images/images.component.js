import { Component } from 'preact';
import style from './images.scss';
import { connect } from 'unistore';
import { store, actions, mappedActions } from '../../datastore';

const {
  addSelection,
  clearSelection,
  loadImages,
  loadImageVersion,
  removeSelection,
  setControlSelect,
  setSelecting,
  setShiftSelect,
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

function handleKeydown({ key }) {
  if (key == 'Shift') setShiftSelect(true);
  if (key == 'Control') setControlSelect(true);
}

function handleKeyup({ key }) {
  if (key == 'Escape') {
    setSelecting(false);
    clearSelection();
  }

  if (key == 'Shift') setShiftSelect(false);
  if (key == 'Control') setControlSelect(false);
}

@connect(({ images, selecting, selection, shiftSelect, controlSelect }) => ({
  images,
  selecting,
  selection,
  shiftSelect,
  controlSelect,
}))
export default class Images extends Component {
  componentWillMount() {
    loadImages();
    window.document.addEventListener('keydown', handleKeydown);
    window.document.addEventListener('keyup', handleKeyup);
  }

  componentWillUnmount() {
    window.document.removeEventListener('keydown', handleKeydown);
    window.document.removeEventListener('keyup', handleKeyup);
  }

  render({ images, selecting, selection, shiftSelect, controlSelect }) {
    const items = images.map(image => {
      const id = image.__id;
      const name = image.name.split('/').pop();
      const height = 200;
      const versionName = `x${height}`;
      const version = (image.versions && image.versions[versionName]) || {};
      const isSelected = selection.has(id);

      if (!version.url) {
        loadImageVersion({ record: image.__id, height });
      }

      return (
        <li item-id={id} class={style.item} is-selected={isSelected} onClick={itemClick}>
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

    function getId(el) {
      const itemId = el.getAttribute('item-id');
      if (itemId) {
        return itemId;
      } else if (el.parentElement) {
        return getId(el.parentElement);
      }
    }

    function iconClick(e) {
      e.stopPropagation();
      const id = getId(e.target);
      const isSelected = selection.has(id);
      if (!isSelected) {
        addSelection(id);
      } else {
        if (selection.size <= 1) {
          setSelecting(false);
        }
        removeSelection(id);
      }
    }

    const base = this.base;
    function itemClick(e) {
      const id = getId(e.target);
      const isSelected = selection.has(id);
      if (controlSelect) {
        if (!isSelected) {
          addSelection(id);
        } else {
          removeSelection(id);
        }
      } else if (shiftSelect) {
        const items = Array.from(base.querySelectorAll('li'));
        const firstSelectedItemIndex = items.findIndex(item => item.getAttribute('is-selected'));
        const clickedItemIndex = items.findIndex(item => item.getAttribute('item-id') == id);
        const startIndex = Math.min(firstSelectedItemIndex, clickedItemIndex);
        const endIndex = Math.max(firstSelectedItemIndex, clickedItemIndex);
        const ids = items.slice(startIndex, endIndex + 1).map(item => item.getAttribute('item-id'));
        addSelection(ids);
      }
    }

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
