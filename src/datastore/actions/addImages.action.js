export function addImages({ images }, newImages) {
  images = [...images, ...newImages];
  
  const tags = new Set();
  images.forEach(image => image.tags && image.tags.forEach(tag => tags.add(tag)));
  return { images, tags };
}
