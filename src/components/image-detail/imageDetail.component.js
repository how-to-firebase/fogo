import style from './imageDetail.scss';
import { connect } from 'unistore';
import { updateImageQuery } from '../../queries';
import { mappedActions } from '../../datastore';
const { setImage } = mappedActions;

// SVG
import spinner from '../../assets/svg/spinner.svg';
import contentCopy from '../../assets/svg/content-copy.svg';

export default function imageDetail({ environment, image, isAdmin }) {
  const version = getVersion(image);
  const versionRows = image && getVersionRows(image);

  loadImageIfMissing(image);

  const setDescriptionState = descriptionState => {
    this.setState({ descriptionState });
  };

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
          {image.exifTags && (
            <li>
              {image.contentType} @ {image.exifTags.ExifImageHeight}x{image.exifTags.ExifImageWidth}
            </li>
          )}
          {image.exifTags && <li>{new Date(image.exifTags.CreateDate).toString()}</li>}
          {versionRows}
          {isAdmin && (
            <div class={style.textarea}>
              <textarea
                rows="5"
                placeholder="Description..."
                onInput={handleInput({ environment, image, setDescriptionState })}
              >
                {image.description}
              </textarea>
              <aside>{this.state.descriptionState || 'saved'}</aside>
            </div>
          )}
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

function getVersionRows({ exifTags, versions }) {
  return Object.keys(versions).map(key => {
    const version = versions[key];
    if (version != 'loading') {
      const dimensions = getDimensions({ exifTags, key });
      const url = getUrl(version);
      const markdown = getMarkdown(version);

      return [
        <li class={style.copy} onClick={handleCopyClick}>
          <img src={contentCopy} alt="copy url" />
          <span class={style.dimensions}>{dimensions}</span>
          <span>{url}</span>
        </li>,
        <li class={style.copy} onClick={handleCopyClick}>
          <img src={contentCopy} alt="copy markdown" />
          <span class={style.dimensions} />
          <span>{markdown}</span>
        </li>,
      ];
    }
  });
}

function getDimensions({ exifTags, key }) {
  const { ExifImageHeight, ExifImageWidth } = exifTags || {};
  return (key == 'original' && exifTags && `${ExifImageWidth}x${ExifImageHeight}`) || key;
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

let inputTimer;
function handleInput({ environment, image, setDescriptionState }) {
  return ({ target }) => {
    setDescriptionState('saving...');
    if (inputTimer) {
      clearTimeout(inputTimer);
    }
    inputTimer = setTimeout(async () => {
      const description = target.value;
      await updateImageQuery({ environment, image: { ...image, description } });
      setDescriptionState('saved');
    }, 2000);
  };
}
