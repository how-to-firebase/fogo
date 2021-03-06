import style from './drawer.scss';
import { connect } from 'unistore';
import { actions } from '../../datastore';
import { Link } from 'preact-router/match';

// Preact Material Components
import Drawer from 'preact-material-components/Drawer';
import List from 'preact-material-components/List';
import 'preact-material-components/Drawer/style.css';
import 'preact-material-components/List/style.css';

export default connect('showMenu', actions)(({ showMenu, toggleMenu }) => (
  <div class={style.wrapper}>
    <Drawer.TemporaryDrawer open={showMenu} onClose={toggleMenu} className={style.drawer}>
      <Drawer.TemporaryDrawerContent className={style.drawerContent}>
        <List className={style.list}>
          <Link activeClassName="active" href="/images">
            <List.LinkItem className={style.item}>Images</List.LinkItem>
          </Link>
          <Link activeClassName="active" href="/galleries">
            <List.LinkItem className={style.item}>Galleries</List.LinkItem>
          </Link>
          <Link activeClassName="active" href="/login">
            <List.LinkItem className={style.item}>Sign Out</List.LinkItem>
          </Link>
        </List>
      </Drawer.TemporaryDrawerContent>
    </Drawer.TemporaryDrawer>
  </div>
));
