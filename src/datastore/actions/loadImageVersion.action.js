export async function loadImageVersion({ images, environment }, { record, width }) {
  const imageUrl = `${environment.urls.image}?record=${record}&width=${width}`;

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
      const image = images.find(image => image.__id == record);
      image.versions = { ...image.versions, [width]: { url } };
      return { images };
    })
    .catch(error => console.log('error', error));
}
