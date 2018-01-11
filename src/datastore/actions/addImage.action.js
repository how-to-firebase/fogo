export function addImage({ images, tags }, image) {
  images = [image, ...images];
  if (image.tags) {
    image.tags.forEach(tag => tags.add(tag));
  }

  return { images, tags };
}
