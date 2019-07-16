import style from './tags.view.scss';
import { connect } from 'unistore';
import { actions } from '../../datastore';

import Tags from '../tags/tags.component';

const TagsView = connect('selection', actions)(({ selection }) => (
  <div id="tags-view" class={style.tagsView} view="tags">
    <h1 class={style.header}>Tags</h1>
    <Tags selection={selection} />
  </div>
));

export { TagsView };
