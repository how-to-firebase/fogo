import { imageQuery } from './image.query';
import { mappedActions } from '../datastore';
import { batch } from '../utils';
const { updateImage } = mappedActions;
const addToBatch = batch('update');

export async function updateTagsQuery({ environment, id, tags }) {
  const uploads = environment.collections.uploads;
  const doc = window.firebase
    .firestore()
    .collection(uploads)
    .doc(id);

  if (!tags.size) {
    tags = null;
  } else {
    tags = Array.from(tags).reduce((tags, tag) => {
      tags[tag] = true;
      return tags;
    }, {});
  }

  await addToBatch(doc, { tags });
  const updatedImage = await imageQuery(environment, id);
  updateImage(updatedImage);
}
