import style from './nav.scss';
import { connect } from 'unistore';
import { actions } from '../../datastore';

// Preact Material Components
import Button from 'preact-material-components/Button';
import Icon from 'preact-material-components/Icon';
import Toolbar from 'preact-material-components/Toolbar';
import 'preact-material-components/Button/style.css';
import 'preact-material-components/Icon/style.css';
import 'preact-material-components/Toolbar/style.css';

export default connect('showMenu,selection', actions)(
  ({ showMenu, selection, toggleMenu, deleteSelection, addSelectionToGallery }) => (
    <Toolbar className={style['mdc-toolbar']}>
      <Toolbar.Row>
        <Toolbar.Section align-start={true} className={style['mdc-toolbar__section']}>
          <Toolbar.Icon menu={true} onClick={toggleMenu}>
            menu
          </Toolbar.Icon>
          <Toolbar.Title className={style['mdc-toolbar__title']}>Fogo</Toolbar.Title>
          {!!selection.size && (
            <div class={style.actions}>
              <Icon className={style.icon} onClick={addSelectionToGallery}>
                add
              </Icon>
              <Icon className={style.icon} onClick={deleteSelection}>
                delete
              </Icon>
            </div>
          )}
        </Toolbar.Section>
      </Toolbar.Row>
    </Toolbar>
  )
);
