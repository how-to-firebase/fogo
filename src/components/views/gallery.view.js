import style from './gallery.view.scss';
import { mappedActions } from '../../datastore';

export function GalleryView(props) {
  console.log('props', props);
  return (
    <div id="gallery-view" class={style.galleryView} view="gallery">
      <h1 class={style.header}>Gallery</h1>
    </div>
  );
}
