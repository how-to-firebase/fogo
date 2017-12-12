import style from './nav.scss';
import { connect } from 'unistore';
import { actions } from '../../datastore';

// Preact Material Components
import Toolbar from 'preact-material-components/Toolbar';
import 'preact-material-components/Toolbar/style.css';

export default connect('showMenu', actions)(({ showMenu, toggleMenu }) => (
  <Toolbar className={style['mdc-toolbar']}>
    <Toolbar.Row>
      <Toolbar.Section align-start={true}>
        <Toolbar.Icon menu={true} onClick={toggleMenu}>
          menu
        </Toolbar.Icon>
        <Toolbar.Title className={style['mdc-toolbar__title']}>Fogo</Toolbar.Title>
      </Toolbar.Section>
    </Toolbar.Row>
  </Toolbar>
));
