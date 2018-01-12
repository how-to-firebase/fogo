export function updateImage({ environment, images, image }, updatedImage) {
  const { __id: id } = updatedImage;
  const imageIndex = images.findIndex(image => image.__id == id);

  images = images.slice(0);

  if (image && image.__id == id) {
    image = updatedImage;
  }

  images[imageIndex] = updatedImage;

  const tags = new Set();
  images.forEach(image => image.tags && image.tags.forEach(tag => tags.add(tag)));

  return { images, image, tags };
}
