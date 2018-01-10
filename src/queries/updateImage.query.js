import { imageQuery } from './image.query';
import { mappedActions } from '../datastore';
const { updateImage } = mappedActions;

export async function updateImageQuery({ environment, image }) {
  const { __id: id, description } = image;
  const uploads = environment.collections.uploads;
  const doc = window.firebase
    .firestore()
    .collection(uploads)
    .doc(id);

  await doc.set({ description }, { merge: true });
  const updatedImage = await imageQuery(environment, id);
  updateImage(updatedImage);
}
