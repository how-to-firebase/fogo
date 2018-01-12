const methods = new Set(['set', 'update', 'delete']);

export function batch(method, timeout = 300) {
  if (!methods.has(method)) {
    throw new Error(`Method not valid: ${method}`);
  } else {
    let jobs = [];
    let timer;

    function execute(jobs) {
      const batch = window.firebase.firestore().batch();
      const localJobs = pullJobs(jobs);

      localJobs.forEach(({ ref, payload }) => batch[method](ref, payload));
      batch
        .commit()
        .then(() => resolveJobs(localJobs))
        .catch(error => {
          console.error('batch error', error);
        });
    }

    function pullJobs(jobs) {
      const result = [];
      while (jobs.length) {
        result.push(jobs.pop());
      }
      return result;
    }

    function resolveJobs(jobs) {
      jobs.forEach(({ resolve }) => resolve());
    }

    return function addToBatch(ref, payload) {
      return new Promise((resolve, reject) => {
        jobs.push({ ref, payload, resolve });

        if (timer) {
          clearTimeout(timer);
        }

        if (jobs.length == 4) {
          execute(jobs);
        } else {
          timer = setTimeout(() => execute(jobs), timeout);
        }
      });
    };
  }
}
