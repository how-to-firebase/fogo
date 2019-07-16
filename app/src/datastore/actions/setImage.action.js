export function setImage(state, { ...image }) {
  if (!Object.keys(image).length) {
    image = null;
  }
  return { image };
}
