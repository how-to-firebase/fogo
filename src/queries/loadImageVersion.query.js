const axios = require('axios');

export async function loadImageVersion({environment, record, width, height }) {
  const versionType = (width && 'width') || 'height';
  const versionName = (height && `x${height}`) || width || 'original';
  let imageUrl = `${environment.urls.image}?record=${record}`;

  if (width || height) {
    imageUrl += `&${versionType}=${width || height}`;
  }

  const { data: url } = await axios.get(imageUrl);
  return url;
}
