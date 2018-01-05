import style from './imageDetail.scss';
import { connect } from 'unistore';
import { mappedActions } from '../../datastore';
const { setImage } = mappedActions;

// SVG
import spinner from '../../assets/svg/spinner.svg';
import contentCopy from '../../assets/svg/content-copy.svg';

export default function imageDetail({ image }) {
  const version = getVersion(image);
  const versionRows = image && getVersionRows(image);

  loadImageIfMissing(image);

  return (
    image && (
      <div id="overlay" class={style.overlay} onClick={handleOverlayClick}>
        <img
          class={style.image}
          src={(version && version.url) || spinner}
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

function loadImageIfMissing(image) {
  if (image && !getVersion(image)) {
    setImage({ ...image, versions: { original: 'loading' } });
  }
}

function getVersion(image) {
  const versionName = 'original';
  const { versions } = image || {};
  return versions && versions[versionName];
}

function getVersionRows({ tags, versions }) {
  return Object.keys(versions).map(key => {
    const version = versions[key];
    if (version != 'loading') {
      const dimensions = getDimensions({ tags, key });
      const url = getUrl(version);
      const markdown = getMarkdown(version);

      return [
        <li class={style.copy} onClick={handleCopyClick}>
          <img src={contentCopy} alt="copy url"/>
          <span class={style.dimensions}>{dimensions}</span>
          <span>{url}</span>
        </li>,
        <li class={style.copy} onClick={handleCopyClick}>
          <img src={contentCopy} alt="copy markdown"/>
          <span class={style.dimensions} />
          <span>{markdown}</span>
        </li>,
      ];
    }
  });
}

function getDimensions({ tags, key }) {
  const { ExifImageHeight, ExifImageWidth } = tags || {};
  return (key == 'original' && tags && `${ExifImageWidth}x${ExifImageHeight}`) || key;
}

function getMarkdown(version) {
  const filename = getFilename(version);
  const url = getUrl(version);
  return `![${filename}](${url})`;
}

function getFilename(version) {
  return version.name.split('/').pop();
}

function getUrl(version) {
  return version.shortUrl || version.url;
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

  fireAlert('Copied to clipboard');
}

function fireAlert(detail) {
  dispatchEvent(new CustomEvent('alert', { detail, bubbles: true }));
}
