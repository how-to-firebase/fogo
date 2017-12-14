import style from './home.scss';
import { Link } from 'preact-router/match';
import { actions } from '../../datastore';
import Fab from 'preact-material-components/Fab';
import 'preact-material-components/Fab/style.css';

export function HomeView() {
  return (
    <div class={style.home} view="home">
      <Link href="/upload">
        <Fab>
          <Fab.Icon>add</Fab.Icon>
        </Fab>
      </Link>
    </div>
  );
}
