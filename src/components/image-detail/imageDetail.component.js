import style from './imageDetail.scss';
import { connect } from 'unistore';
import { mappedActions } from '../../datastore';
const { setImage, loadImageVersion } = mappedActions;

import spinnerSvg from '../../assets/svg/spinner.svg';

export default function imageDetail({ image }) {
  console.log('image', image);
  const versionName = 'original';
  const { versions } = image || {};
  const version = versions && versions[versionName];

  if (image && !version) {
    setImage({ ...image, versions: { original: 'loading' } });
    loadImageVersion({ record: image.__id });
  }

  function handleOverlayClick(e) {
    if (e.target.id == 'overlay') {
      setImage();
    }
  }

  return (
    image && (
      <div id="overlay" class={style.overlay} onClick={handleOverlayClick}>
        <img
          class={style.image}
          src={(version && version.url) || spinnerSvg}
          alt={version && version.name}
        />
        <ul class={style.description}>
          <li>{image.name}</li>
          <li>{image.contentType}</li>
          <li>{new Date(image.tags.CreateDate).toString()}</li>
          <li>
            {image.tags.ExifImageHeight}x{image.tags.ExifImageWidth}
          </li>
        </ul>
      </div>
    )
  );
}
