import style from './imageDetail.scss';
import { connect } from 'unistore';
import { mappedActions } from '../../datastore';
const { setImage } = mappedActions;

import spinnerSvg from '../../assets/svg/spinner.svg';

import Icon from 'preact-material-components/Icon';

export default function imageDetail({ image }) {
  const versionName = 'original';
  const { versions } = image || {};
  const version = versions && versions[versionName];
  const versionRows = image && getVersionRows(image);

  if (image && !version) {
    setImage({ ...image, versions: { original: 'loading' } });
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
          {image.tags && (
            <li>
              {image.contentType} @ {image.tags.ExifImageHeight}x{image.tags.ExifImageWidth}
            </li>
          )}
          {image.tags && <li>{new Date(image.tags.CreateDate).toString()}</li>}
          {versionRows}
        </ul>
      </div>
    )
  );
}

function getVersionRows({ tags, versions }) {
  const { ExifImageHeight, ExifImageWidth } = tags || {};

  return Object.keys(versions).map(key => {
    const version = versions[key];
    if (version != 'loading') {
      const dimensions =
        (key == 'original' && tags && `${ExifImageWidth}x${ExifImageHeight}`) || key;
      const filename = version.name.split('/').pop();
      const url = version.shortUrl || version.url;
      const markdown = `![${filename}](${url})`;
      return [
        <li class={style.copy} onClick={handleCopyClick}>
          <Icon>content_copy</Icon>
          <span class={style.dimensions}>{dimensions}</span>
          <span>{url}</span>
        </li>,
        <li class={style.copy} onClick={handleCopyClick}>
          <Icon>content_copy</Icon>
          <span class={style.dimensions} />
          <span>{markdown}</span>
        </li>,
      ];
    }
  });
}

function handleOverlayClick(e) {
  if (e.target.id == 'overlay') {
    setImage();
  }
}

function handleCopyClick({ target }) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(target.parentElement.children[2]);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');

  dispatchEvent(new CustomEvent('alert', { detail: 'Copied text to clipboard', bubbles: true }));
}
