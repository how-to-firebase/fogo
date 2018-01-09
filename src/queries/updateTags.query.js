import { imageQuery } from './image.query';
import { mappedActions } from '../datastore';
const { updateImage } = mappedActions;

export async function updateTagsQuery({ environment, id, tags }) {
  const uploads = environment.collections.uploads;
  const doc = window.firebase
    .firestore()
    .collection(uploads)
    .doc(id);

  tags = Array.from(tags).reduce((tags, tag) => {
    tags[tag] = true;
    return tags;
  }, {});
  await doc.set({ tags }, { merge: true });
  const updatedImage = await imageQuery(environment, id);
  updateImage(updatedImage);
}
