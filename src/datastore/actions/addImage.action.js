export function addImage({ images }, image) {
  const found = !!images.find(x => x.__id == image.__id);
  if (!found) {
    images = [image, ...images];
    console.log('added image', image);
  }

  return { images };
}
