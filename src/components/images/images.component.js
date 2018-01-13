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
const spinner = '/assets/svg/spinner.svg';
const threeDots = '/assets/svg/three-dots.svg';
const contentCopy = '/assets/svg/content-copy.svg';
const openWith = '/assets/svg/open-with.svg';

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
    this.__evaluateLoadingPosition = getEvaluateLoadingPosition(this.props);
    window.document.addEventListener('scroll', this.__evaluateLoadingPosition);
    window.document.addEventListener('keyup', handleKeyup);

    const { environment } = this.props;
    const lastCreated = getLastCreated(store.getState());
    this.__imagesSubscription = imagesObserver({ environment, lastCreated }).subscribe(
      handleNewImages({ environment, store })
    );
  }

  componentDidMount() {
    this.handleResize();
    this.__handleResize = this.handleResize.bind(this);
    addEventListener('resize', this.__handleResize);
  }

  componentWillUnmount() {
    window.document.removeEventListener('scroll', this.__evaluateLoadingPosition);
    window.document.removeEventListener('keyup', handleKeyup);
    removeEventListener('resize', this.__handleResize);
    this.__imagesSubscription.unsubscribe();
  }

  componentDidUpdate() {
    this.__evaluateLoadingPosition();
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
      base,
      environment,
      images,
      selection,
    });
    const selectClick = getSelectClickHandler({
      base,
      isAdmin,
      selection,
    });
    const copyClick = getCopyClickHandler();

    const decoratedImages = getDecoratedImages({ searching, search, searchResults, images });
    const items = justifyWidths({ images: decoratedImages, gutter: GUTTER, imagesWidth }).map(
      image =>
        getImageRow({
          image,
          isAdmin,
          selection,
          copyClick,
          imageDetailClick,
          selectClick,
        })
    );

    return (
      <div>
        <ImageDetail
          image={image}
          isAdmin={isAdmin}
          environment={environment}
          onClick={() => setSelecting(false)}
        />
        <ul class={style.grid} selecting={selecting} is-admin={isAdmin} disable-scroll={!!image}>
          {items}
          {imagesAllLoaded &&
            items.length == 1 && <li class={style.emptyState}>Nothing to show 😪</li>}
        </ul>
        <div
          id="loading-bar"
          className={style.loadMore}
          style={(imagesAllLoaded || searching) && 'visibility: hidden;'}
        >
          <img src={threeDots} alt="Loading..." />
        </div>
      </div>
    );
  }
}

// Lifecycle functions
function getEvaluateLoadingPosition({ environment, pageSize }) {
  return debounce(() => {
    const { images, imagesAllLoaded, searching } = store.getState();

    if (!imagesAllLoaded && !searching) {
      evaluateLoadingPosition({ pageSize, environment, images });
    }
  }, 500);
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

async function evaluateLoadingPosition({ pageSize: limit, environment, images }) {
  const loadingBar = window.document.getElementById('loading-bar');
  const scroll = window.document.body.parentElement.scrollTop;
  const top = loadingBar.getBoundingClientRect().top;
  const viewportHeight = window.visualViewport.height;

  let imagesToLoad = images;
  if (top < viewportHeight) {
    const cursor = images[images.length - 1];
    const { results, imagesAllLoaded } = await imagesQuery({ environment, cursor, limit });
    addImages(results);
    setImagesAllLoaded(imagesAllLoaded);
    imagesToLoad = results;
  }

  imagesToLoad.forEach(image =>
    loadImageVersionIfNecessary({ environment, image, versionName: VERSION_NAME })
  );
}

function getLastCreated({ images, timestamp }) {
  return (
    (images.length &&
      images.reduce((timestamp, image) => {
        return Math.max(timestamp, image.created);
      }, 0)) ||
    timestamp
  );
}

function handleNewImages({ environment, store }) {
  return newImages => {
    const { images } = store.getState();
    const existingIds = new Set(images.map(x => x.__id));
    const differenceIds = new Set(newImages.map(x => x.__id).filter(id => !existingIds.has(id)));
    const imagesToAdd = newImages.filter(image => differenceIds.has(image.__id));

    imagesToAdd.forEach(image => {
      addImage(image);
      loadImageVersionIfNecessary({ environment, image, versionName: VERSION_NAME });
    });
  };
}

function handleKeyup({ key }) {
  if (key == 'Escape') {
    setSelecting(false);
    clearSelection();
    setImage();
  }
}

// Render event handlers
function getSelectClickHandler({ base, isAdmin, selection }) {
  return e => {
    e.stopPropagation();
    if (isAdmin) {
      const id = getId(e.target);
      const isSelected = selection.has(id);
      if (!isSelected) {
        if (e.shiftKey) {
          multiSelect({ id, base, addSelection });
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

function getImageDetailClickHandler({ base, environment, images, selection }) {
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
      multiSelect({ id, base, addSelection });
    } else {
      const image = images.find(image => image.__id == id);
      setImage(image);
      loadImageVersionIfNecessary({ environment, image });
    }
  };
}

function getId(el) {
  const itemId = el.getAttribute('item-id');
  return itemId || (el.parentElement && getId(el.parentElement));
}

function multiSelect({ id, base, addSelection }) {
  const items = Array.from(base.querySelectorAll('li'));
  const firstSelectedItemIndex = items.findIndex(item => item.getAttribute('is-selected'));
  const clickedItemIndex = items.findIndex(item => item.getAttribute('item-id') == id);
  const startIndex = Math.min(firstSelectedItemIndex, clickedItemIndex);
  const endIndex = Math.max(firstSelectedItemIndex, clickedItemIndex);
  const ids = items.slice(startIndex, endIndex + 1).map(item => item.getAttribute('item-id'));
  addSelection((ids.length && ids) || id);
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

// Render main
function getDecoratedImages({ searching, search, searchResults, images }) {
  const imagesToDecorate =
    (searching && search && ((searchResults && searchResults.hits) || [])) || images;
  return imagesToDecorate
    .map(image => addImageWidth({ image }))
    .map(image => addImageVersion({ image }));
}

function addImageWidth({ image }) {
  const height = HEIGHT;
  let width = DEFAULT_WIDTH;
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

function addImageVersion({ image }) {
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

// Render image rows
function getImageRow({ image, isAdmin, selection, copyClick, imageDetailClick, selectClick }) {
  let li;
  if (image.isGrower) {
    li = <li style={`width: ${image.width}px;`} />;
  } else {
    const { __id: id, _highlightResult: highlightResult } = image;
    const name = image.filename;
    const isSelected = selection.has(id);
    const markdown = getMarkdown(image);
    const tagItems = getTagsItems(image);
    const selectSvg = getSelectSvg({ isAdmin, selectClick });

    li = (
      <li item-id={id} class={style.item} is-selected={isSelected}>
        {selectSvg}

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
        <ul class={style.tagList}>{tagItems}</ul>
        <span class={style.markdown} copy>
          {markdown}
        </span>
        <div class={style.image}>
          <div
            class={style.img}
            style={`background-image: url('${image.version.url ||
              spinner}'); width: ${image.width || DEFAULT_WIDTH}px;`}
          />
        </div>
      </li>
    );
  }
  return li;
}

function getMarkdown(image) {
  const url = image.version.shortUrl || image.version.url;
  const name = image.filename;
  return `![${name}](${url})`;
}

function getTagsItems({ tags, _highlightResult: highlightResult }) {
  const searchTag =
    highlightResult && highlightResult.tags && highlightResult.tags.map(x => x.value);
  const decoratedTags = searchTag || tags || [];
  return decoratedTags.map(tag => {
    return (
      <li
        dangerouslySetInnerHTML={{
          __html: tag,
        }}
      />
    );
  });
}

function getSelectSvg({ isAdmin, selectClick }) {
  return (
    isAdmin && (
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
    )
  );
}
