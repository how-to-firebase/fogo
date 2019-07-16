import style from './galleries.view.scss';
import { connect } from 'unistore';
import { actions } from '../../datastore';

const GalleriesView = connect('tags', actions)(({ tags }) => (
  <div id="galleries-view" class={style.galleriesView} view="galleries">
    {getItems(tags)}
  </div>
));

function getItems(tags) {
  return Array.from(tags).map(tag => (
    <div class={style.row}>
      <a href={`/gallery/${tag}`} target="_blank">
        <img src="/assets/svg/view-carousel.svg" alt={`add ${tag}`} />
      </a>
      <a href={`/embed/${tag}`} target="_blank">
        <img src="/assets/svg/share.svg" alt={`add ${tag}`} />
      </a>
      <h3>#{tag}</h3>
    </div>
  ));
}

export { GalleriesView };
