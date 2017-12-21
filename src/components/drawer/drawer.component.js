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
  <div>
    <Drawer.TemporaryDrawer open={showMenu} onClose={toggleMenu} className={style.drawer}>
      <Drawer.TemporaryDrawerContent>
        <List className={style.list}>
          <Link activeClassName="active" href="/">
            <List.LinkItem className={style.item}>Home</List.LinkItem>
          </Link>
          <Link activeClassName="active" href="/play">
            <List.LinkItem className={style.item}>Play</List.LinkItem>
          </Link>
          <Link activeClassName="active" href="/login">
            <List.LinkItem className={style.item}>Sign Out</List.LinkItem>
          </Link>
        </List>
      </Drawer.TemporaryDrawerContent>
    </Drawer.TemporaryDrawer>
  </div>
));
