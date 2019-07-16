import style from './embed.view.scss';
import { connect } from 'unistore';
import { actions } from '../../datastore';

export function EmbedView({ tag }) {
  return (
    <div id="embed-view" class={style.embedView} view="embed">
      <textarea cols="30" rows="10">
        {`<iframe src="${location.origin}/gallery/${tag}" frameborder="0" />`}
      </textarea>
      <iframe src={`/gallery/${tag}`} frameborder="0" />
      <iframe src={`/gallery/${tag}`} frameborder="0" style="width: 500px; height: 500px; background: black;"/>
      <iframe src={`/gallery/${tag}`} frameborder="0" style="width: 100vw; height: 500px; background: gold;"/>
    </div>
  );
}
