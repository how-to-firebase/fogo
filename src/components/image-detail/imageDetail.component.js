import style from './imageDetail.scss';
import { connect } from 'unistore';
import { mappedActions } from '../../datastore';
const { setImage, loadImageVersion } = mappedActions;

import spinnerSvg from '../../assets/svg/spinner.svg';

import Icon from 'preact-material-components/Icon';

export default function imageDetail({ image }) {
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

  const base = this.base;
  function handleCopyClick({ target }) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target.parentElement.children[1]);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');

    dispatchEvent(new CustomEvent('alert', { detail: 'Copied text to clipboard', bubbles: true }));
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
          <li>{image.name.split('/').pop()}</li>
          <li>
            {image.contentType} @ {image.tags.ExifImageHeight}x{image.tags.ExifImageWidth}
          </li>
          <li>{new Date(image.tags.CreateDate).toString()}</li>
          {version && (
            <li class={style.copy} onClick={handleCopyClick}>
              <Icon>content_copy</Icon>
              <span class={style.copyTarget}>{version.url}</span>
            </li>
          )}
        </ul>
      </div>
    )
  );
}
