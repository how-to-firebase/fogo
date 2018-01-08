import style from './nav.scss';
import { connect } from 'unistore';
import { actions } from '../../datastore';
import { Link } from 'preact-router/match';

// Preact Material Components
import Button from 'preact-material-components/Button';
import Toolbar from 'preact-material-components/Toolbar';
import 'preact-material-components/Button/style.css';
import 'preact-material-components/Toolbar/style.css';

import Search from '../search/search.component';

// svg
import add from '../../assets/svg/add.svg';
import deleteSvg from '../../assets/svg/delete.svg';
import menu from '../../assets/svg/menu.svg';

export default connect('showMenu,path,selection', actions)(
  ({ showMenu, path, selection, toggleMenu, deleteSelection, addSelectionToGallery }) => (
    <Toolbar className={style['mdc-toolbar']}>
      <Toolbar.Row>
        <Toolbar.Section align-start={true} className={style['mdc-toolbar__section']}>
          <img
            class={style.toolbarIcon}
            src={menu}
            alt="Open menu"
            menu={true}
            onClick={toggleMenu}
          />
          <Toolbar.Title className={style['mdc-toolbar__title']}>Fogo</Toolbar.Title>
          <div class={style.actions}>
            {path == '/images' && [
              <Search />,
              <div>
                {!!selection.size && [
                  <Link href="/tags">
                    <img class={style.icon} src={add} alt="Tags" onClick={addSelectionToGallery} />
                  </Link>,
                  <img
                    class={style.icon}
                    src={deleteSvg}
                    alt="Delete images"
                    onClick={deleteSelection}
                  />,
                ]}
              </div>,
            ]}
          </div>
        </Toolbar.Section>
      </Toolbar.Row>
    </Toolbar>
  )
);
