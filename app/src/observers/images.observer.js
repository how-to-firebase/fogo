import { Observable } from 'rxjs/Observable';

export function imagesObserver({ environment, lastCreated }) {
  return Observable.create(observer => {
    const uploads = environment.collections.uploads;
    const orderedCollection = window.firebase
      .firestore()
      .collection(uploads)
      .where('environment', '==', environment.environment)
      .where('created', '>', lastCreated)
      .orderBy('created', 'desc');

    let laggedIds = new Set();
    return orderedCollection.onSnapshot(snapshot => {
      const results = snapshot.docs
        .filter(doc => !laggedIds.has(doc.id))
        .map(doc => ({ __id: doc.id, ...doc.data() }));

      results.forEach(({ __id }) => laggedIds.add(__id));

      laggedIds = new Set(snapshot.docs.map(doc => doc.id));

      observer.next(results);
    });
  });
}
