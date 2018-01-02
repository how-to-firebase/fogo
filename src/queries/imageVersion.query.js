import axios from 'axios';
import { mappedActions } from '../datastore';
const { setImageVersion } = mappedActions;

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
  if (!image.versions || (!image.versions[versionName] && !loadingQueue.has(image.name))) {
    loadingQueue.add(image.name);
    const id = image.__id;
    const url = await imageVersionQuery({ environment, record: id, versionName });
    setImageVersion({ id, versionName, url });
    loadingQueue.delete(image.name);
  }
}
