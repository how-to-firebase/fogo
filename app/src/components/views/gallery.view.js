import style from './gallery.view.scss';
import { imagesByTagQuery, imageVersionQuery } from '../../queries';

const spinner = '../../assets/svg/spinner.svg';

let increment;
let setWindowFocus;
window.addEventListener('keyup', ({ key }) => {
  if (increment) {
    if (key == 'ArrowRight') {
      increment(1);
    } else if (key == 'ArrowLeft') {
      increment(-1);
    }
  }
});
window.addEventListener('focus', e => setWindowFocus && setWindowFocus(true));
window.addEventListener('blur', e => setWindowFocus && setWindowFocus(false));

export function GalleryView({ environment }) {
  const pathParts = location.pathname.split('/').slice(1);
  const [galleryName, tag] = pathParts;
  const { focused, images, index } = this.state;
  const length = (images && images.length) || 0;
  const i = index || 0;
  const image = images && images[i];
  const setImages = images => {
    this.setState({ images });
    saveToLocalStorage({ images, tag });
  };
  const setImage = image => {
    const id = image.__id;
    const index = images.findIndex(image => image.__id == id);
    images[index] = image;
    setImages(images);
  };
  const setIndex = nextI => {
    const index = (nextI == -1 && length - 1) || nextI % length;
    this.setState({ index });
  };
  const changeImage = next => e => increment((next && 1) || -1);

  increment = change => setIndex(i + change);

  setWindowFocus = focused => this.setState({ focused });

  getImages({ environment, images, tag, setImages });

  ensureOriginal({ environment, image, setImage });

  return (
    <div id="gallery-view" class={style.galleryView} view="gallery" focused={focused}>
      {image && (
        <span>
          <img
            class={style.image}
            src={(image.versions.original && image.versions.original.url) || spinner}
            alt={image.filename}
          />
        </span>
      )}
      <div class={style.backdrop} />
      <div class={style.details}>
        {image && [
          <p>{image.description}</p>,
          <i>← →</i>,
          <aside>
            {i + 1}/{images.length}
          </aside>,
          <img
            class={style.right}
            src="/assets/svg/skip-next.svg"
            alt="next image"
            onClick={changeImage(true)}
          />,
          <img
            class={style.left}
            src="/assets/svg/skip-next.svg"
            alt="previous image"
            onClick={changeImage(false)}
          />,
        ]}
      </div>
    </div>
  );
}

// Manage state
const LOCALSTORAGE_NAME = 'fogo-gallery';
const savedString = window.localStorage.getItem(LOCALSTORAGE_NAME);
const saved = JSON.parse(savedString);
const now = Date.now();

function getImages({ environment, images, tag, setImages }) {
  if (!images) {
    if (isSavedValid({ now, saved, tag })) {
      setImages(saved.images);
    } else {
      imagesByTagQuery({ environment, tag }).then(images => {
        setImages(images);
      });
    }
  }
}

function isSavedValid({ now, saved, tag }) {
  const tenMinutes = 1000 * 60 * 10;
  return !!saved && saved.tag == tag && saved.timestamp + tenMinutes > now;
}

function saveToLocalStorage({ images, tag }) {
  const payload = {
    images,
    tag,
    timestamp: Date.now(),
  };
  localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(payload));
}

function ensureOriginal({ environment, image, setImage }) {
  if (image && (!image.versions || !image.versions.original)) {
    imageVersionQuery({ environment, record: image.__id, versionName: 'original' }).then(url => {
      image.versions = {
        original: {
          url,
        },
      };
      setImage(image);
    });
  }
}
