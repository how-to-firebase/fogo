const axios = require('axios');

export async function loadImageVersion({ images, image, environment }, { record, width, height }) {
  const versionType = (width && 'width') || 'height';
  const versionName = (height && `x${height}`) || width || 'original';
  let imageUrl = `${environment.urls.image}?record=${record}`;

  if (width || height) {
    imageUrl += `&${versionType}=${width || height}`;
  }

  images.slice(0);

  const { data: url } = await axios.get(imageUrl);
  const imageIndex = images.findIndex(image => image.__id == record);
  const clone = { ...images[imageIndex] };
  clone.versions = { ...clone.versions, [versionName]: { url } };

  if (!clone.versions[versionName].url) {
    console.error('url missing!', url);
    clone.versions[versionName].url = null;
  }

  if (image && image.__id == record) {
    image = { ...clone };
  }

  images[imageIndex] = clone;

  return { images, image, timestamp: Date.now() };
}
