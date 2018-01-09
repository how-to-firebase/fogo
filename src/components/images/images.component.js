import { Component } from 'preact';
import style from './images.scss';
import { connect } from 'unistore';
import { store, actions, mappedActions } from '../../datastore';
import { imagesObserver } from '../../observers';
import { imagesQuery, loadImageVersionIfNecessary } from '../../queries';

const {
  addImage,
  addImages,
  addSelection,
  clearSelection,
  removeSelection,
  setImage,
  setImagesAllLoaded,
  setImagesWidth,
  setSelecting,
} = mappedActions;

// Svg
import spinner from '../../assets/svg/spinner.svg';
import threeDots from '../../assets/svg/three-dots.svg';
import contentCopy from '../../assets/svg/content-copy.svg';
import openWith from '../../assets/svg/open-with.svg';
import checkCircle from '../../assets/svg/check-circle.svg';

// Components
import ImageDetail from '../image-detail/imageDetail.component';

// constants
const GUTTER = 4;
const HEIGHT = 200;
const DEFAULT_WIDTH = 200;
const VERSION_NAME = `x${HEIGHT}`;

@connect(
  ({
    environment,
    images,
    imagesAllLoaded,
    imagesWidth,
    image,
    isAdmin,
    search,
    searching,
    searchResults,
    selecting,
    selection,
    timestamp,
  }) => ({
    environment,
    images,
    imagesAllLoaded,
    imagesWidth,
    image,
    isAdmin,
    search,
    searching,
    searchResults,
    selecting,
    selection,
    timestamp,
  })
)
export default class Images extends Component {
  componentWillMount() {
    const { environment, pageSize } = this.props;

    this.__debouncedEvaluateLoading = debounce(() => {
      const { images, imagesAllLoaded } = store.getState();

      if (!imagesAllLoaded) {
        evaluateLoadingPosition({ pageSize, environment, images });
      }
    }, 500);

    this.__handleScroll = this.__debouncedEvaluateLoading;
    window.document.addEventListener('keyup', handleKeyup);
    window.document.addEventListener('scroll', this.__handleScroll);

    const { images, timestamp } = store.getState();
    const lastCreated =
      (images.length &&
        images.reduce((timestamp, image) => {
          return Math.max(timestamp, image.created);
        }, 0)) ||
      timestamp;

    this.__imagesSubscription = imagesObserver({ environment, lastCreated }).subscribe(
      newImages => {
        const { images } = store.getState();
        const existingIds = new Set(images.map(x => x.__id));
        const differenceIds = new Set(
          newImages.map(x => x.__id).filter(id => !existingIds.has(id))
        );
        const imagesToAdd = newImages.filter(image => differenceIds.has(image.__id));

        imagesToAdd.forEach(image => {
          addImage(image);
          loadImageVersionIfNecessary({ environment, image, versionName: VERSION_NAME });
        });
      }
    );
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

  componentDidUpdate() {
    this.__debouncedEvaluateLoading();
  }

  handleResize() {
    setImagesWidth(this.base.offsetWidth);
  }

  render({
    environment,
    images,
    imagesAllLoaded,
    imagesWidth,
    image,
    isAdmin,
    search,
    searching,
    searchResults,
    selecting,
    selection,
  }) {
    const base = this.base;
    const imageDetailClick = getImageDetailClickHandler({
      environment,
      images,
      base,
      selection,
      addSelection,
      removeSelection,
      setImage,
    });
    const selectClick = getSelectClickHandler({
      base,
      isAdmin,
      selection,
      addSelection,
      setSelecting,
      removeSelection,
    });
    const copyClick = getCopyClickHandler();

    const imagesToDecorate =
      (searching && search && ((searchResults && searchResults.hits) || [])) || images;
    const decoratedImages = imagesToDecorate
      .map(image => addImageWidth({ image, height: HEIGHT, defaultWidth: DEFAULT_WIDTH }))
      .map(image => addImageVersion({ image, height: HEIGHT }));
    const items = justifyWidths({ images: decoratedImages, gutter: GUTTER, imagesWidth }).map(
      image =>
        getImageRow({
          image,
          isAdmin,
          selection,
          defaultWidth: DEFAULT_WIDTH,
          copyClick,
          imageDetailClick,
          selectClick,
        })
    );

    return (
      <div>
        <ImageDetail image={image} environment={environment} onClick={() => setSelecting(false)} />
        <ul class={style.grid} selecting={selecting} is-admin={isAdmin}>
          {items}
          {imagesAllLoaded &&
            items.length == 1 && <li class={style.emptyState}>No images... yet 😪</li>}
        </ul>
        <div
          id="loading-bar"
          className={style.loadMore}
          style={imagesAllLoaded && 'visibility: hidden;'}
        >
          <img src={threeDots} alt="Loading..." />
        </div>
      </div>
    );
  }
}

function debounce(fn, millis) {
  let timer;

  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, millis);
  };
}

function handleKeyup({ key }) {
  if (key == 'Escape') {
    setSelecting(false);
    clearSelection();
    setImage();
  }
}

async function evaluateLoadingPosition({ pageSize: limit, environment, images }) {
  const loadingBar = window.document.getElementById('loading-bar');
  const scroll = window.document.body.parentElement.scrollTop;
  const top = loadingBar.getBoundingClientRect().top;
  const viewportHeight = window.visualViewport.height;

  if (top < viewportHeight) {
    const cursor = images[images.length - 1];
    const { results, imagesAllLoaded } = await imagesQuery({ environment, cursor, limit });
    addImages(results);
    setImagesAllLoaded(imagesAllLoaded);
    results.forEach(image =>
      loadImageVersionIfNecessary({ environment, image, versionName: VERSION_NAME })
    );
  }
}

function addImageWidth({ image, height, defaultWidth }) {
  let width = defaultWidth;
  image = { ...image };
  if (image.exifTags) {
    const { ImageHeight, ImageWidth } = image.exifTags;
    if (ImageHeight && ImageWidth) {
      width = height / (ImageHeight / ImageWidth);
    }
  }
  image.width = width;
  return image;
}

function addImageVersion({ height, image }) {
  const version = (image.versions && image.versions[VERSION_NAME]) || {};
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

function getImageRow({
  image,
  isAdmin,
  selection,
  defaultWidth,
  copyClick,
  imageDetailClick,
  selectClick,
}) {
  let li;
  if (image.isGrower) {
    li = <li style={`width: ${image.width}px;`} />;
  } else {
    const { __id: id, _highlightResult: highlightResult } = image;
    const name = image.name.split('/').pop();
    const isSelected = selection.has(id);
    const markdown = getMarkdown(image);

    li = (
      <li item-id={id} class={style.item} is-selected={isSelected}>
        {isAdmin && (
          <svg
            class={style.icon}
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            onClick={selectClick}
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        )}

        <div class={style.actions}>
          <img src={openWith} alt="open image detail" onClick={imageDetailClick} />
          <img src={contentCopy} alt="copy image markdown" onClick={copyClick} />
        </div>
        <div
          class={style.description}
          onClick={selectClick}
          dangerouslySetInnerHTML={{
            __html: (highlightResult && highlightResult.filename.value) || name,
          }}
        />
        <span class={style.markdown} copy>
          {markdown}
        </span>
        <div class={style.image}>
          <div
            class={style.img}
            style={`background-image: url('${image.version.url ||
              spinner}'); width: ${image.width || defaultWidth}px;`}
          />
        </div>
      </li>
    );
  }
  return li;
}

function getMarkdown(image) {
  const url = image.version.shortUrl || image.version.url;
  const name = image.name.split('/').pop();
  return `![${name}](${url})`;
}

function getSelectClickHandler({
  base,
  isAdmin,
  selection,
  addSelection,
  setSelecting,
  removeSelection,
}) {
  return e => {
    e.stopPropagation();
    if (isAdmin) {
      const id = getId(e.target);
      const isSelected = selection.has(id);
      if (!isSelected) {
        if (e.shiftKey) {
          multiSelect({ id, base });
        } else {
          addSelection(id);
        }
      } else {
        if (selection.size <= 1) {
          setSelecting(false);
        }
        removeSelection(id);
      }
    }
  };
}

function getImageDetailClickHandler({
  environment,
  images,
  base,
  selection,
  addSelection,
  removeSelection,
  setImage,
}) {
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
      multiSelect({ id, base });
    } else {
      const image = images.find(image => image.__id == id);
      setImage(image);
      loadImageVersionIfNecessary({ environment, image });
    }
  };
}

function getCopyClickHandler() {
  return e => {
    const el = e.target.parentElement.parentElement.querySelector('[copy]');
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');

    fireAlert('Copied to clipboard');
  };
}

function fireAlert(detail) {
  dispatchEvent(new CustomEvent('alert', { detail, bubbles: true }));
}

function multiSelect({ id, base }) {
  const items = Array.from(base.querySelectorAll('li'));
  const firstSelectedItemIndex = items.findIndex(item => item.getAttribute('is-selected'));
  const clickedItemIndex = items.findIndex(item => item.getAttribute('item-id') == id);
  const startIndex = Math.min(firstSelectedItemIndex, clickedItemIndex);
  const endIndex = Math.max(firstSelectedItemIndex, clickedItemIndex);
  const ids = items.slice(startIndex, endIndex + 1).map(item => item.getAttribute('item-id'));
  addSelection((ids.length && ids) || id);
}

function getId(el) {
  const itemId = el.getAttribute('item-id');
  return itemId || (el.parentElement && getId(el.parentElement));
}
