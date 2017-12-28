import { Component } from 'preact';
import style from './images.scss';
import { connect } from 'unistore';
import { store, actions, mappedActions } from '../../datastore';
import { imagesObserver } from '../../observers';

const {
  addImage,
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
import threeDotsSvg from '../../assets/svg/three-dots.svg';

// Components
import ImageDetail from '../image-detail/imageDetail.component';

@connect(({ images, imagesAllLoaded, imagesWidth, image, selecting, selection }) => ({
  images,
  imagesAllLoaded,
  imagesWidth,
  image,
  selecting,
  selection,
}))
export default class Images extends Component {
  componentWillMount() {
    const { environment, pageSize } = this.props;
    loadImages(pageSize);
    this.__handleScroll = getHandleScroll({ store, pageSize });
    window.document.addEventListener('keyup', handleKeyup);
    window.document.addEventListener('scroll', this.__handleScroll);

    this.__imagesSubscription = imagesObserver({ environment }).subscribe(addImage);
  }

  componentDidMount() {
    this.handleResize();
    this.__handleResize = this.handleResize.bind(this);
    addEventListener('resize', this.__handleResize);
  }

  componentWillUnmount() {
    window.document.removeEventListener('keyup', handleKeyup);
    window.document.removeEventListener('scroll', this.__handleScroll);
    removeEventListener('resize', this.__handleResize);
    this.__imagesSubscription.unsubscribe();
  }

  handleResize() {
    setImagesWidth(this.base.offsetWidth);
  }

  render({ images, imagesAllLoaded, imagesWidth, image, selecting, selection }) {
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
      getImageRow({ image, selection, height, loadImageVersion, itemClick, iconClick })
    );

    let loadingButton;
    return (
      <div>
        <ImageDetail image={image} onClick={() => setSelecting(false)} />
        <ul class={style.grid} selecting={selecting}>
          {items}
        </ul>
        <Button
          id="loading-button"
          className={style.loadMore}
          onClick={loadImages}
          style={imagesAllLoaded && 'visibility: hidden;'}
        >
          <img src={threeDotsSvg} alt="Loading..." />
        </Button>
      </div>
    );
  }
}

function handleKeyup({ key }) {
  if (key == 'Escape') {
    setSelecting(false);
    clearSelection();
    setImage();
  }
}

function getHandleScroll({ store, pageSize }) {
  let handleScrollTimer;

  return e => {
    if (handleScrollTimer) {
      clearTimeout(handleScrollTimer);
    }

    const { imagesAllLoaded } = store.getState();
    if (!imagesAllLoaded) {
      handleScrollTimer = setTimeout(() => {
        const loadingButton = window.document.getElementById('loading-button');
        const scroll = window.document.body.parentElement.scrollTop;
        const top = loadingButton.getBoundingClientRect().top;
        const viewportHeight = window.visualViewport.height;
        const shouldShowLoader = !!scroll;

        if (shouldShowLoader && top < viewportHeight) {
          loadImages(pageSize);
        }
      }, 500);
    }
  };
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

function getImageRow({ image, selection, height, loadImageVersion, itemClick, iconClick }) {
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
