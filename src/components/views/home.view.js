import style from './home.scss';
import { Link } from 'preact-router/match';
import Fab from 'preact-material-components/Fab';
import 'preact-material-components/Fab/style.css';

import Images from "../images/images.component";

export function HomeView() {
  return (
    <div id="home-view" class={style.home} view="home">
      <Images pageSize="25" />
      <Link href="/upload" class={style.fab}>
        <Fab>
          <Fab.Icon>add</Fab.Icon>
        </Fab>
      </Link>
    </div>
  );
}
