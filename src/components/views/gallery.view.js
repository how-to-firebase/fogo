import style from './gallery.view.scss';
import { imagesByTagQuery } from '../../queries';

export function GalleryView({ environment }) {
  const tag = location.pathname.split('/').pop();


  imagesByTagQuery({ environment, tag }).then(images => {
    console.log('images', images);
  });

  return (
    <div id="gallery-view" class={style.galleryView} view="gallery">
      <h1 class={style.header}>Gallery</h1>
    </div>
  );
}
