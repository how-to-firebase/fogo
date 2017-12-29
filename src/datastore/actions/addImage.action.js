export function addImage({ images }, image) {
  images = [image, ...images];
  return { images };
}
