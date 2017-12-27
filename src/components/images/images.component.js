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
  setImage,
  setImagesWidth,
  setSelecting,
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

// Components
import ImageDetail from '../image-detail/imageDetail.component';

function handleKeyup({ key }) {
  if (key == 'Escape') {
    setSelecting(false);
    clearSelection();
    setImage();
  }
}

@connect(({ images, imagesWidth, image, selecting, selection }) => ({
  images,
  imagesWidth,
  image,
  selecting,
  selection,
}))
export default class Images extends Component {
  componentWillMount() {
    loadImages();
    window.document.addEventListener('keyup', handleKeyup);
  }

  componentDidMount() {
    this.handleResize();
    this.__handleResize = this.handleResize.bind(this);
    addEventListener('resize', this.__handleResize);
  }

  componentWillUnmount() {
    window.document.removeEventListener('keyup', handleKeyup);
    removeEventListener('resize', this.__handleResize);
  }

  handleResize() {
    setImagesWidth(this.base.offsetWidth);
  }

  render({ images, imagesWidth, image, selecting, selection }) {
    const itemClick = getItemClickHandler({
      images,
      base: this.base,
      selection,
      addSelection,
      removeSelection,
      setImage,
    });
    const iconClick = getIconClickHandler({
      selection,
      addSelection,
      setSelecting,
      removeSelection,
    });
    const gutter = 4;
    const height = 200;
    const defaultWidth = 200;
    const decoratedImages = images
      .map(image => addImageWidth({ image, height, defaultWidth }))
      .map(image => addImageVersion({ image, height }));
    const items = justifyWidths({ images: decoratedImages, gutter, imagesWidth }).map(image =>
      getImageRow({ image, selection, loadImageVersion, itemClick, iconClick })
    );

    return (
      <div>
        <ImageDetail image={image} onClick={() => setSelecting(false)} />
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

function addImageWidth({ image, height, defaultWidth }) {
  let width = defaultWidth;
  image = { ...image };
  if (image.tags) {
    const { ImageHeight, ImageWidth } = image.tags;
    if (ImageHeight && ImageWidth) {
      width = height / (ImageHeight / ImageWidth);
    }
  }
  image.width = width;
  return image;
}

function addImageVersion({ height, image }) {
  const versionName = `x${height}`;
  const version = (image.versions && image.versions[versionName]) || {};
  image = { ...image };
  image.version = version;
  return image;
}

function justifyWidths({ images, gutter, imagesWidth }) {
  const rows = images.reduce(
    (rows, { ...image }) => {
      const lastRow = rows[rows.length - 1];
      const cumulativeWidths = sumRowWidths(lastRow);
      const lastRowWidth = gutter * lastRow.length + cumulativeWidths;
      if (lastRowWidth < imagesWidth) {
        lastRow.push(image);
      } else {
        rows.push([image]);
      }
      return rows;
    },
    [[]]
  );
  const adjustedRows = rows.map(row => {
    const goalWidth = imagesWidth - row.length * gutter;
    const totalWidth = sumRowWidths(row);
    const difference = totalWidth - goalWidth;

    if (difference > 0) {
      row.forEach(image => {
        const percentageOfRow = image.width / totalWidth;
        image.width = image.width - difference * percentageOfRow;
      });
    } else {
      row.push({ isGrower: true, width: -1 * difference });
    }

    return row;
  });
  return adjustedRows.reduce((flat, row) => flat.concat(row), []);
}

function sumRowWidths(row) {
  return row.reduce((sum, image) => sum + image.width, 0);
}

function getImageRow({ image, selection, loadImageVersion, itemClick, iconClick }) {
  let li;
  if (image.isGrower) {
    li = <li style={`width: ${image.width}px;`} />;
  } else {
    const id = image.__id;
    const name = image.name.split('/').pop();
    const isSelected = selection.has(id);

    if (!image.version.url) {
      loadImageVersion({ record: image.__id, height });
    }

    li = (
      <li item-id={id} class={style.item} is-selected={isSelected} onClick={itemClick}>
        <Icon className={`${style.icon}`} onClick={iconClick}>
          done
        </Icon>
        <div class={style.description}>{name}</div>
        <div class={style.image}>
          <div
            class={style.img}
            style={`background-image: url('${image.version.url ||
              spinnerSvg}'); width: ${image.width || defaultWidth}px;`}
          />
        </div>
      </li>
    );
  }
  return li;
}

function getIconClickHandler({ selection, addSelection, setSelecting, removeSelection }) {
  return e => {
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
  };
}

function getItemClickHandler({ images, base, selection, addSelection, removeSelection, setImage }) {
  return e => {
    const id = getId(e.target);
    const isSelected = selection.has(id);

    if (e.ctrlKey) {
      if (!isSelected) {
        addSelection(id);
      } else {
        removeSelection(id);
      }
    } else if (e.shiftKey) {
      const items = Array.from(base.querySelectorAll('li'));
      const firstSelectedItemIndex = items.findIndex(item => item.getAttribute('is-selected'));
      const clickedItemIndex = items.findIndex(item => item.getAttribute('item-id') == id);
      const startIndex = Math.min(firstSelectedItemIndex, clickedItemIndex);
      const endIndex = Math.max(firstSelectedItemIndex, clickedItemIndex);
      const ids = items.slice(startIndex, endIndex + 1).map(item => item.getAttribute('item-id'));
      addSelection(ids);
    } else {
      const image = images.find(image => image.__id == id);
      setImage(image);
    }
  };
}

function getId(el) {
  const itemId = el.getAttribute('item-id');
  if (itemId) {
    return itemId;
  } else if (el.parentElement) {
    return getId(el.parentElement);
  }
}
