export function setImageVersion(
  { images, image, environment },
  { id, versionName, url }
) {
  const imageIndex = images.findIndex(image => image.__id == id);
  const clone = { ...images[imageIndex] };

  images = images.slice(0);

  clone.versions = { ...clone.versions, [versionName]: { url } };

  if (!clone.versions[versionName].url) {
    console.error('url missing!', url);
    clone.versions[versionName].url = null;
  }

  if (image && image.__id == id) {
    image = { ...clone };
  }

  images[imageIndex] = clone;

  return { images, image };
}
