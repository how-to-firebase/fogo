export function updateImage({ images, image, environment }, updatedImage) {
  const { __id: id } = updatedImage;
  const imageIndex = images.findIndex(image => image.__id == id);

  images = images.slice(0);

  if (image && image.__id == id) {
    image = updatedImage;
  }

  images[imageIndex] = updatedImage;

  return { images, image };
}
