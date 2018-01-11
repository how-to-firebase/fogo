export function addImages({ images, tags }, newImages) {
  images = [...images, ...newImages];
  images.forEach(image => image.tags && image.tags.forEach(tag => tags.add(tag)));
  return { images, tags };
}
