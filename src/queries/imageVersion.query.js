import axios from 'axios';
import { imageQuery } from './image.query';
import { mappedActions } from '../datastore';
const { updateImage } = mappedActions;

export async function imageVersionQuery({ environment, record, versionName }) {
  let imageUrl = `${environment.urls.image}?record=${record}`;

  if (versionName != 'original') {
    const isHeight = versionName[0] == 'x';
    const versionType = (isHeight && 'height') || 'width';
    const versionParam = (isHeight && versionName.slice(1)) || versionName;
    imageUrl += `&${versionType}=${versionParam}`;
  }

  const { data: url } = await axios.get(imageUrl);
  return url;
}

const loadingQueue = new Set();
export async function loadImageVersionIfNecessary({
  environment,
  image,
  versionName = 'original',
}) {
  const { name, __id: id } = image;
  if (!image.versions || (!image.versions[versionName] && !loadingQueue.has(name))) {
    loadingQueue.add(name);
    const url = await imageVersionQuery({ environment, record: id, versionName });
    const updatedImage = await imageQuery(environment, id);
    updateImage(updatedImage);
    loadingQueue.delete(name);
  }
}
