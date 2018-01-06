import { Observable } from 'rxjs/Observable';
import { store } from '../datastore';

export function searchObserver({ environment }) {
  const { applicationId, apiKey } = environment.algolia;
  const { algoliasearch } = window;
  const client = algoliasearch(applicationId, apiKey);
  const index = client.initIndex(environment.indexes.uploads);
  const timeout = 500;

  return Observable.create(observer => {
    let lastSearched;
    let timer;
    return store.subscribe(({ search }) => {
      if (timer) {
        clearTimeout(timer);
      }
      if (search && search != lastSearched) {
        timer = setTimeout(() => {
          lastSearched = search;
          index.search(search).then(results => {
            const hits = results.hits.map(result => ({ __id: result.objectID, ...result.search }));
            observer.next({ ...results, hits });
          });
        }, timeout);
      }
    });
  });
}
