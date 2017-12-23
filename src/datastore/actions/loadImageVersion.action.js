export async function loadImageVersion({ images, image, environment }, { record, width, height }) {
  const versionType = (width && 'width') || 'height';
  const versionName = (height && `x${height}`) || width || 'original';
  let imageUrl = `${environment.urls.image}?record=${record}`;

  if (width || height) {
    imageUrl += `&${versionType}=${width || height}`;
  }

  images = images.slice(0);

  return fetch(imageUrl)
    .then(res => {
      let response;
      if (!res.body) {
        response = Promise.reject('res.body missing');
      } else {
        response = res.body.getReader().read();
      }
      return response;
    })
    .then(({ value }) => {
      const url = new TextDecoder().decode(value);
      const imageToPatch = images.find(image => image.__id == record);
      imageToPatch.versions = { ...imageToPatch.versions, [versionName]: { url } };

      if (image && image.__id == record) {
        image = { ...imageToPatch };
      }

      return { images, image };
    })
    .catch(error => console.log('error', error));
}
