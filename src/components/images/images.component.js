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
    const tiles = images.map(image => {
      const name = image.name.split('/').pop();
      const width = 200;
      const version = (image.versions && image.versions[width]) || {};

      if (!version.url) {
        loadImageVersion({ record: image.__id, width });
      }

      return (
        <GridList.Tile>
          <GridList.PrimaryTile>
            <GridList.PrimaryContentTile src={version.url || spinnerSvg} />
          </GridList.PrimaryTile>
          <GridList.SecondaryTile className={style.secondary}>
            <GridList.IconTile onClick={() => console.log('Edit Tile')}>edit</GridList.IconTile>
            <GridList.TitleTile className={style.title}>{name}</GridList.TitleTile>
          </GridList.SecondaryTile>
        </GridList.Tile>
      );
    });

    return (
      <div>
        ul
        <GridList
          header-caption={true}
          with-icon-align="end"
          twoline-caption={true}
          tile-aspect="1x1"
        >
          <GridList.Tiles className={style.tiles}>{tiles}</GridList.Tiles>
        </GridList>
        <Button className={style.loadMore} onClick={loadImages}>
          Load More
        </Button>
      </div>
    );
  }
}
