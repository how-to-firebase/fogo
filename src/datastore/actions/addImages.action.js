export function addImages({ images }, newImages) {
  images = [...images, ...newImages];
  return { images };
}
