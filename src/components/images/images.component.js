import { Component } from 'preact';
import style from './images.scss';
import { connect } from 'unistore';
import { store, actions, mappedActions } from '../../datastore';

const { loadImages, loadImageVersion } = mappedActions;

// Preact Material
import GridList from 'preact-material-components/GridList';
import Button from 'preact-material-components/Button';
import 'preact-material-components/GridList/style.css';
import 'preact-material-components/Button/style.css';

// Svg
import spinnerSvg from '../../assets/svg/spinner.svg';

@connect(({ images }) => ({ images }))
export default class Images extends Component {
  componentWillMount() {
    loadImages();
  }

  render({ images }) {
    const items = images.map(image => {
      const name = image.name.split('/').pop();
      const width = 250;
      const version = (image.versions && image.versions[width]) || {};

      if (!version.url) {
        loadImageVersion({ record: image.__id, width });
      }

      return (
        <li class={style.item}>
          <div class={style.description}>{name}</div>
          <div class={style.image}>
            <img src={version.url || spinnerSvg} alt={name} />
          </div>
        </li>
      );
    });

    return (
      <div>
        <ul class={style.grid}>{items}</ul>

        <Button className={style.loadMore} onClick={loadImages}>
          Load More
        </Button>
      </div>
    );
  }
}
