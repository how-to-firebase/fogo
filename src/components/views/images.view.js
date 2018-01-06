import style from './images.view.scss';
import { connect } from 'unistore';
import { actions } from '../../datastore';
import { Link } from 'preact-router/match';
import Fab from 'preact-material-components/Fab';
import 'preact-material-components/Fab/style.css';

import Images from '../images/images.component';

// svg
import add from "../../assets/svg/add.svg";

const ImagesView = connect('environment,searching,token', actions)(({ environment, searching, token }) => (
  <div id="images-view" class={style.imagesView} view="images">
    <h1 class={style.header}>{searching && 'Search results' || 'All images'}</h1>
    <Images pageSize="3" environment={environment} />
    {token && token.admin && (
      <Link href="/upload" class={style.fab}>
        <Fab>
          <img src={add} alt="add images"/>
        </Fab>
      </Link>
    )}
  </div>
));

export { ImagesView };
