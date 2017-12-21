export async function loadImageVersion({ images, environment }, { record, width }) {
  const imageUrl = `${environment.urls.image}?record=${record}&width=${width}`;

  images = images.slice(0);

  return fetch(imageUrl)
    .then(res => res.body.getReader().read())
    .then(({ value }) => {
      const url = new TextDecoder().decode(value);
      const image = images.find(image => image.__id == record);
      image.versions = { ...image.versions, [width]: { url } };
      return { images };
    });
}
