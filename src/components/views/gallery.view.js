import style from './gallery.view.scss';
import { imagesByTagQuery } from '../../queries';

export function GalleryView({ environment }) {
  const tag = location.pathname.split('/').pop();
  const { images, index } = this.state;
  const image = images && images[index || 0];
  const setImages = images => {
    this.setState({ images });
  };

  getImages({ environment, images, tag, setImages });

  console.log('image', image);
  return (
    <div id="gallery-view" class={style.galleryView} view="gallery">
      {image && (
        <span>
          <img src={image.versions.original.url} alt={image.filename} />
        </span>
      )}
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
        saveToLocalStorage({ images, tag });
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
